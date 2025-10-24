import { GoogleGenAI, Type } from "@google/genai";
import { Message, LeadData, LeadDataKey, ChatConfig } from "../types";

const BASE_MAKE_URL = "https://hook.us2.make.com/";
const SECONDARY_API_KEY = "AIzaSyAr-ZhYtdZ-b3jzXvIUjANB0A5dQSxHcV4";

const getAiClient = (apiKey: string | undefined) => {
    if (!apiKey) {
        throw new Error("API key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

const createSystemPrompt = (assistantName: string, consultantName: string): string => `
Você é ${assistantName}, o assistente de planejamento de ${consultantName}, um consultor da Ademicon. Sua missão é ajudar os clientes a organizar as informações sobre seus projetos de vida para que ${consultantName} possa oferecer a melhor estratégia de aquisição. Você é empático, focado nos sonhos do cliente e usa uma linguagem de planejamento e conquista. Siga estritamente estas regras:

1.  **NUNCA USE A PALAVRA 'CONSÓRCIO'**: Sua comunicação deve ser focada em 'planejamento para aquisição', 'projeto', 'realização de objetivos', 'conquista'. Evite a palavra 'consórcio' a todo custo.

2.  **LIDANDO COM PERGUNTAS DIRETAS**: Se o cliente perguntar diretamente sobre o produto (ex: "mas isso é um consórcio?"), sua resposta deve ser amigável e direcionar para o especialista. Responda: "Essa é uma ótima pergunta! O ${consultantName} é o especialista que vai te apresentar em detalhes a melhor estratégia para o seu projeto. Meu papel aqui é apenas coletar algumas informações iniciais para que ele já chegue na conversa com um plano desenhado para você." e, em seguida, retorne à pergunta do fluxo.

3.  **Contexto e Início**: Sua primeira mensagem deve ser calorosa e convidativa. Algo como: "Olá! Que ótimo ter você aqui. Para começarmos nosso planejamento, qual o seu <strong>nome completo</strong>, por favor?". Depois, use o contexto para determinar qual é o próximo dado que falta coletar.

4.  **Fluxo de Conversa**: Siga uma conversa natural para obter as seguintes informações, UMA DE CADA VEZ, na seguinte ordem estrita:
    *   \`client_name\`
    *   \`topic\`
    *   \`valor_credito\`
    *   \`reserva_mensal\`
    *   \`client_whatsapp\`
    *   \`client_email\`
    *   \`meeting_type\`
    *   \`start_datetime\` (Pergunte primeiro o dia, depois a hora)

5.  **Interação**:
    *   Faça apenas UMA pergunta por vez.
    *   Seja breve, amigável e direto. Use palavras como "planejamento", "objetivo", "projeto".
    *   Use **negrito** (usando a tag \`<strong>\`) para destacar a informação que você está pedindo.
    *   Se a última mensagem do usuário for um dia da semana, sua próxima pergunta DEVE ser sobre o **horário**.

6.  **Saída JSON**:
    *   Sua resposta DEVE ser um objeto JSON válido.
    *   O JSON deve conter o campo "responseText", que é a sua mensagem para o usuário.
    *   O JSON deve conter "nextKey", indicando qual a próxima informação a ser coletada no fluxo. Se todas as informações foram coletadas, retorne null para "nextKey".
    *   O JSON deve conter APENAS os campos de dados do lead que você conseguiu extrair da ÚLTIMA resposta do usuário. NÃO inclua campos que você já tinha.

7.  **Ações da Interface**:
    *   Quando for a hora de perguntar sobre o \`start_datetime\`, sua primeira pergunta deve ser APENAS sobre o dia da semana. Neste caso, sua resposta JSON DEVE incluir o campo \`action: 'SHOW_DAY_OPTIONS'\` e a \`nextKey\` deve ser \`start_datetime\`.
`;

const leadDataSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: { type: Type.STRING, description: "A resposta em texto para ser exibida ao usuário." },
        nextKey: { type: Type.STRING, nullable: true, description: "A chave do próximo dado a ser coletado (ex: 'client_name', 'topic'). Retorne null se tudo foi coletado." },
        client_name: { type: Type.STRING, description: "Nome completo do cliente." },
        topic: { type: Type.STRING, enum: ['Imóvel', 'Automóvel', 'Investimento', 'Viagem', 'Outro'], description: "O objetivo principal do cliente. (Ex: Imóvel, Automóvel, Viagem, Investimento, ou Outro se for para entender melhor as opções de planejamento)." },
        valor_credito: { type: Type.NUMBER, description: "O valor total do crédito ou projeto. O valor mínimo é 15.000. Se o usuário disser '100', '100k' ou '100 mil', interprete como 100000." },
        reserva_mensal: { type: Type.NUMBER, description: "O valor que o cliente pode investir mensalmente. Se o usuário disser '1', '1k' ou '1 mil', interprete como 1000." },
        client_whatsapp: { type: Type.STRING, description: "Número de WhatsApp do cliente com DDD." },
        client_email: { type: Type.STRING, description: "Endereço de e-mail do cliente." },
        meeting_type: { type: Type.STRING, enum: ['Videochamada', 'Presencial'], description: "Preferência de reunião." },
        start_datetime: { type: Type.STRING, description: "Data e hora sugeridas para a reunião (ex: 'Sexta-feira às 15:00')." },
        action: { type: Type.STRING, enum: ['SHOW_DAY_OPTIONS'], description: "Uma ação que a interface do usuário deve executar." }
    },
    required: ["responseText", "nextKey"]
};

type AiResponse = {
    updatedLeadData: Partial<LeadData>;
    responseText: string;
    action: string | null;
    nextKey: LeadDataKey | null;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callApiWithRetry = async <T>(apiFn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await apiFn();
        } catch (error: any) {
            lastError = error;
            const errorMessage = error.toString().toLowerCase();
            if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('unavailable') || errorMessage.includes('rate limit')) {
                 if (i < retries - 1) {
                    const waitTime = delay * Math.pow(2, i);
                    console.warn(`API call failed due to transient error, retrying in ${waitTime}ms...`);
                    await sleep(waitTime);
                }
            } else {
                throw lastError;
            }
        }
    }
    throw lastError;
};

const callApiWithFallbackAndRetry = async (apiCall: (ai: GoogleGenAI) => Promise<any>) => {
    try {
        const primaryAi = getAiClient(process.env.API_KEY);
        return await callApiWithRetry(() => apiCall(primaryAi));
    } catch (primaryError) {
        console.warn("Primary API key failed after retries. Trying fallback.", primaryError);
        try {
            const secondaryAi = getAiClient(SECONDARY_API_KEY);
            return await callApiWithRetry(() => apiCall(secondaryAi));
        } catch (secondaryError) {
            console.error("Fallback API key also failed after retries.", secondaryError);
            throw new Error("Both API keys failed, switching to local script.");
        }
    }
};

export const getAiResponse = async (
    history: Message[],
    currentData: Partial<LeadData>,
    config: ChatConfig
): Promise<AiResponse> => {
    const contextMessage = `[CONTEXTO] Dados já coletados: ${JSON.stringify(currentData)}. Analise o histórico e o contexto para determinar a próxima pergunta.`;
    
    const contents: {role: 'user' | 'model', parts: {text: string}[]}[] = [{
        role: 'user',
        parts: [{ text: contextMessage }]
    }];

    for (const msg of history) {
        contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    }
    
    const systemInstruction = createSystemPrompt(config.assistantName, config.consultantName);

    const response = await callApiWithFallbackAndRetry(ai => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: leadDataSchema
        }
    }));

    const jsonText = response.text;
    try {
        const parsedJson = JSON.parse(jsonText);
        const { responseText, action, nextKey, ...updatedLeadData } = parsedJson;
        
        const formattedText = (responseText || "Desculpe, não entendi. Pode repetir?")
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        return {
            updatedLeadData,
            responseText: formattedText,
            action: action || null,
            nextKey: nextKey || null
        };
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", jsonText, e);
        throw new Error("JSON parsing failed");
    }
};

export const getFinalSummary = async (leadData: Partial<LeadData>, config: ChatConfig): Promise<string> => {
    const summaryPrompt = `Crie um resumo de confirmação conciso e amigável para um agendamento com ${config.consultantName}, baseado nos dados JSON a seguir.
NÃO inclua uma saudação inicial (como "Olá"). Comece diretamente com uma frase como "Perfeito, {client_name}! Por favor, confirme se os dados para nosso planejamento estão corretos:".
Formate a saída em HTML. Use a tag <strong> para destacar informações chave (nome, valores, data/hora). Use <br> para quebras de linha.
O tom deve ser profissional e positivo.
Termine com a pergunta "Podemos confirmar o agendamento?".

Dados:
${JSON.stringify(leadData, null, 2)}`;

    const response = await callApiWithFallbackAndRetry(ai => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: summaryPrompt,
    }));

    return response.text.trim();
};


// --- Fallback Logic (Non-AI) ---
const parseHumanNumber = (text: string, assumeThousandsForSmallNumbers = false): number => {
    let normalizedText = text.toLowerCase().trim().replace(/r\$|\./g, '').replace(',', '.');
    let multiplier = 1;
    if (normalizedText.includes('k') || normalizedText.includes('mil')) {
        multiplier = 1000;
        normalizedText = normalizedText.replace(/k|mil/g, '').trim();
    }
    const numericMatch = normalizedText.match(/[+-]?([0-9]*[.])?[0-9]+/);
    if (!numericMatch) return NaN;
    let value = parseFloat(numericMatch[0]);
    if (isNaN(value)) return NaN;
    value *= multiplier;
    if (assumeThousandsForSmallNumbers && multiplier === 1 && value >= 15 && value < 1000) {
        value *= 1000;
    }
    return value;
};


const fallbackFlow: LeadDataKey[] = [
    'client_name', 'topic', 'valor_credito', 'reserva_mensal',
    'client_whatsapp', 'client_email', 'meeting_type', 'start_datetime'
];

const getFallbackQuestions = (config: ChatConfig): Record<LeadDataKey, string> => ({
    client_name: "Olá! Que ótimo ter você aqui. Para começarmos nosso planejamento, qual o seu <strong>nome completo</strong>, por favor?",
    topic: "Obrigado, {client_name}! Qual o seu <strong>objetivo principal</strong> com este planejamento? (Ex: <strong>Carro</strong>, <strong>Imóvel</strong>, <strong>Viagem</strong>, <strong>Investir/Planejar</strong> ou outro projeto)",
    valor_credito: "Entendi. Para este projeto, qual o <strong>valor de crédito</strong> aproximado que você está buscando?",
    reserva_mensal: "Ótimo! Para o seu planejamento, qual seria o valor da sua <strong>reserva mensal</strong> para essa aquisição?",
    client_whatsapp: `Perfeito. Para que ${config.consultantName} possa entrar em contato, qual o seu melhor <strong>WhatsApp com DDD</strong>?`,
    client_email: "E qual o seu <strong>melhor e-mail</strong> para mantermos contato?",
    meeting_type: "Estamos quase lá! Você prefere uma reunião por <strong>Videochamada</strong> ou <strong>Presencial</strong>?",
    start_datetime: "Qual o melhor <strong>dia da semana</strong> para a nossa conversa?",
    final_summary: "",
    source: ""
});


export const getFallbackResponse = (
    lastUserMessage: string,
    currentData: Partial<LeadData>,
    keyToCollect: LeadDataKey | null,
    config: ChatConfig
): AiResponse => {
    let updatedLeadData = { ...currentData };

    if (keyToCollect && lastUserMessage) {
        if (keyToCollect === 'start_datetime' && currentData.start_datetime && !currentData.start_datetime.includes('às')) {
            updatedLeadData.start_datetime = `${currentData.start_datetime} às ${lastUserMessage}`;
        } else if (keyToCollect === 'valor_credito') {
            const numericValue = parseHumanNumber(lastUserMessage, true);
            if (!isNaN(numericValue)) updatedLeadData[keyToCollect] = numericValue;
        } else if (keyToCollect === 'reserva_mensal') {
            const numericValue = parseHumanNumber(lastUserMessage, false);
            if (!isNaN(numericValue)) updatedLeadData[keyToCollect] = numericValue;
        } else {
            (updatedLeadData as Record<string, unknown>)[keyToCollect] = lastUserMessage;
        }
    }

    if (keyToCollect === 'start_datetime' && updatedLeadData.start_datetime && !updatedLeadData.start_datetime.includes('às')) {
        return {
            updatedLeadData,
            responseText: "Ótimo. E qual seria o <strong>melhor horário</strong> para você nesse dia?",
            action: null,
            nextKey: 'start_datetime'
        };
    }

    const nextKey = fallbackFlow.find(key => {
         if (key === 'start_datetime') {
            return !(updatedLeadData.start_datetime && updatedLeadData.start_datetime.includes('às'));
        }
        return !updatedLeadData.hasOwnProperty(key);
    }) || null;

    if (!nextKey) {
        return { updatedLeadData, responseText: "", action: null, nextKey: null };
    }

    const fallbackQuestions = getFallbackQuestions(config);
    let responseText = fallbackQuestions[nextKey];
    if (nextKey === 'topic' && updatedLeadData.client_name) {
        const firstName = updatedLeadData.client_name.split(' ')[0];
        responseText = responseText.replace('{client_name}', firstName);
    }

    let action = null;
    if (nextKey === 'start_datetime') {
        action = 'SHOW_DAY_OPTIONS';
    }

    return { updatedLeadData, responseText, action, nextKey };
};

export const getFallbackSummary = (leadData: Partial<LeadData>): string => {
    const formatCurrency = (value: number | undefined) => {
        if (value === undefined) return 'Não informado';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    let summary = "Perfeito! Por favor, confirme se os dados abaixo estão corretos:<br><br>";
    summary += `<strong>Nome:</strong> ${leadData.client_name || 'Não informado'}<br>`;
    summary += `<strong>Objetivo:</strong> ${leadData.topic || 'Não informado'}<br>`;
    summary += `<strong>Valor do Crédito:</strong> ${formatCurrency(leadData.valor_credito)}<br>`;
    summary += `<strong>Reserva Mensal:</strong> ${formatCurrency(leadData.reserva_mensal)}<br>`;
    summary += `<strong>WhatsApp:</strong> ${leadData.client_whatsapp || 'Não informado'}<br>`;
    summary += `<strong>E-mail:</strong> ${leadData.client_email || 'Não informado'}<br>`;
    summary += `<strong>Tipo de Reunião:</strong> ${leadData.meeting_type || 'Não informado'}<br>`;
    summary += `<strong>Data/Hora:</strong> ${leadData.start_datetime || 'Não informado'}<br><br>`;
    summary += "Podemos confirmar o agendamento?";

    return summary;
}

const getInternalSummaryForCRM = async (leadData: LeadData, history: Message[], formattedValorCredito: string, formattedReservaMensal: string, consultantName: string): Promise<string> => {
    const conversationHistory = history.map(m => `${m.sender === 'bot' ? 'Assistente' : 'Cliente'}: ${m.text.replace(/<[^>]*>/g, '')}`).join('\n');

    const dataForPrompt = {
        ...leadData,
        valor_credito: formattedValorCredito,
        reserva_mensal: formattedReservaMensal
    };

    const internalSummaryPrompt = `
    Você é um analista de vendas. Sua tarefa é criar um relatório narrativo conciso para o consultor ${consultantName} com base em um resumo de dados e no histórico da conversa com um assistente de IA.

    O relatório deve seguir o formato:
    "Cliente [Nome] busca um planejamento para [Objetivo]. Ele(a) precisa de um crédito de [Valor do Crédito] e pode aportar [Reserva Mensal] mensalmente. [Observações sobre a conversa]."

    Na seção de observações, resuma brevemente a interação. Se o cliente apresentou alguma dúvida, objeção ou ponto importante durante a conversa, mencione isso. Se a conversa foi direta, simplesmente afirme que o cliente foi colaborativo.

    Dados Coletados:
    ${JSON.stringify(dataForPrompt, null, 2)}

    Histórico da Conversa:
    ${conversationHistory}

    Gere apenas o relatório narrativo.
    `;
    
    try {
        const response = await callApiWithFallbackAndRetry(ai => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: internalSummaryPrompt,
        }));
        return response.text.trim();
    } catch (error) {
        console.error("Failed to generate internal CRM summary:", error);
        return "Não foi possível gerar o relatório narrativo da conversa.";
    }
};


export const sendLeadToCRM = async (leadData: LeadData, history: Message[], config: ChatConfig) => {
    const { webhookId, consultantName } = config;
    const MAKE_URL = `${BASE_MAKE_URL}${webhookId}`;
    
    let leadCounter = 1;
    try {
        const storedCounter = localStorage.getItem('leadCounter');
        if (storedCounter) {
            leadCounter = parseInt(storedCounter, 10);
        }
    } catch (e) {
        console.error("Could not access localStorage for lead counter", e);
    }
    const currentLeadNumber = leadCounter;
    try {
        localStorage.setItem('leadCounter', (leadCounter + 1).toString());
    } catch (e) {
        console.error("Could not update localStorage for lead counter", e);
    }

    const { client_name, client_whatsapp, client_email, topic, valor_credito, reserva_mensal, start_datetime, source } = leadData;

    const formattedValorCredito = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor_credito);
    const formattedReservaMensal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reserva_mensal);

    const narrativeReport = await getInternalSummaryForCRM(leadData, history, formattedValorCredito, formattedReservaMensal, consultantName);

    let obsContent = `Lead: ${currentLeadNumber}\n\n`;
    obsContent += "RELATÓRIO DA CONVERSA (IA):\n";
    obsContent += `${narrativeReport}\n\n`;
    obsContent += "--------------------------------------\n\n";
    obsContent += "DADOS CAPTURADOS:\n";
    obsContent += `Origem: ${source || 'Direto'}\n`;
    obsContent += `Nome do Cliente: ${client_name}\n`;
    obsContent += `WhatsApp: ${client_whatsapp || 'Não informado'}\n`;
    obsContent += `E-mail: ${client_email || 'Não informado'}\n`;
    obsContent += `Objetivo do Projeto: ${topic}\n`;
    obsContent += `Valor do Crédito: ${formattedValorCredito}\n`;
    obsContent += `Reserva Mensal: ${formattedReservaMensal}\n`;
    obsContent += `Agendamento Preferencial: ${start_datetime || 'Não informado'}\n\n`;
    
    if (start_datetime) {
        const timeMatch = start_datetime.match(/\b(\d{1,2}):(\d{2})\b/);
        if (timeMatch) {
            const hour = parseInt(timeMatch[1], 10);
            if (hour < 6 || hour >= 22) {
                obsContent += "ATENÇÃO: Horário de agendamento fora do padrão comercial. Recomenda-se ligar para confirmar.\n";
            }
        }
    }

    const requestBody = {
        nome: client_name,
        email: client_email || 'nao-informado@lead.com',
        celular: (client_whatsapp || '').replace(/\D/g, ''),
        cpf_ou_cnpj: "000.000.000-00",
        classificacao1: `Projeto: ${topic}`,
        classificacao2: `${formattedValorCredito}`,
        classificacao3: `Reserva Mensal: ${formattedReservaMensal}`,
        obs: obsContent,
        platform: "GEMSID"
    };

    try {
        await fetch(MAKE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        console.log("Lead enviado para o CRM:", requestBody);
    } catch (error) {
        console.error("Erro ao enviar para o CRM:", error);
    }
};
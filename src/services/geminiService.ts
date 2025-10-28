import { GoogleGenAI, Type } from "@google/genai";
import { Message } from "../model/mensagem/MensagemModel";
import { LeadData, LeadDataKey } from "../model/lead/LeadModel";
import { ChatConfig } from "../model/configuracao/ConfiguracaoChatModel";

const BASE_MAKE_URL = "https://hook.us2.make.com/";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

const createSystemPrompt = (assistantName: string, consultantName: string): string => `
Você é ${assistantName}, o assistente de planejamento de ${consultantName}, um consultor. Sua missão é ajudar os clientes a organizar as informações sobre seus projetos de vida para que ${consultantName} possa oferecer a melhor estratégia de aquisição. Você é empático, focado nos sonhos do cliente e usa uma linguagem de planejamento e conquista. Siga estritamente estas regras:

1.  **NUNCA USE A PALAVRA 'CONSÓRCIO'**: Sua comunicação deve ser focada em 'planejamento para aquisição', 'projeto', 'realização de objetivos', 'conquista'. Evite a palavra 'consórcio' a todo custo.

2.  **LIDANDO COM PERGUNTAS DIRETAS**: Se o cliente perguntar diretamente sobre o produto (ex: "mas isso é um consórcio?"), sua resposta deve ser amigável e direcionar para o especialista. Responda: "Essa é uma ótima pergunta! O ${consultantName} é o especialista que vai te apresentar em detalhes a melhor estratégia para o seu projeto. Meu papel aqui é apenas coletar algumas informações iniciais para que ele já chegue na conversa com um plano desenhado para você." e, em seguida, retorne à pergunta do fluxo.

3.  **Contexto e Início**: Sua primeira mensagem deve ser calorosa e convidativa, se apresentando. Algo como: "Olá! Eu sou ${assistantName}, o assistente de planejamento do ${consultantName}. Que ótimo ter você aqui! Para começarmos, qual o seu <strong>nome completo</strong>, por favor?". Depois, use o contexto para determinar qual é o próximo dado que falta coletar.

4.  **Fluxo de Conversa**: Siga uma conversa natural para obter as seguintes informações, UMA DE CADA VEZ, na seguinte ordem estrita:
    *   \`clientName\`
    *   \`topic\`
    *   \`creditAmount\`
    *   \`monthlyInvestment\`
    *   \`clientWhatsapp\`
    *   \`clientEmail\`
    *   \`meetingType\`
    *   \`startDatetime\` (Pergunte primeiro o dia, depois a hora)

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
    *   Quando for a hora de perguntar sobre o \`startDatetime\`, sua primeira pergunta deve ser APENAS sobre o dia da semana. Neste caso, sua resposta JSON DEVE incluir o campo \`action: 'SHOW_DAY_OPTIONS'\` e a \`nextKey\` deve ser \`startDatetime\`.
`;

const leadDataSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: { type: Type.STRING, description: "A resposta em texto para ser exibida ao usuário." },
        nextKey: { type: Type.STRING, nullable: true, description: "A chave do próximo dado a ser coletado (ex: 'clientName', 'topic'). Retorne null se tudo foi coletado." },
        clientName: { type: Type.STRING, description: "Nome completo do cliente." },
        topic: { type: Type.STRING, enum: ['Imóvel', 'Automóvel', 'Investimento', 'Viagem', 'Outro'], description: "O objetivo principal do cliente. (Ex: Imóvel, Automóvel, Viagem, Investimento, ou Outro se for para entender melhor as opções de planejamento)." },
        creditAmount: { type: Type.NUMBER, description: "O valor total do crédito ou projeto. O valor mínimo é 15.000. Se o usuário disser '100', '100k' ou '100 mil', interprete como 100000." },
        monthlyInvestment: { type: Type.NUMBER, description: "O valor que o cliente pode investir mensalmente. Se o usuário disser '1', '1k' ou '1 mil', interprete como 1000." },
        clientWhatsapp: { type: Type.STRING, description: "Número de WhatsApp do cliente com DDD." },
        clientEmail: { type: Type.STRING, description: "Endereço de e-mail do cliente." },
        meetingType: { type: Type.STRING, enum: ['Videochamada', 'Presencial'], description: "Preferência de reunião." },
        startDatetime: { type: Type.STRING, description: "Data e hora sugeridas para a reunião (ex: 'Sexta-feira às 15:00')." },
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

const callGenerativeApi = async (apiCall: (ai: GoogleGenAI) => Promise<any>) => {
    try {
        const ai = getAiClient();
        return await callApiWithRetry(() => apiCall(ai));
    } catch (error) {
        console.error("API call failed after retries.", error);
        throw new Error("API call failed, switching to local script.");
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

    const response = await callGenerativeApi(ai => ai.models.generateContent({
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
NÃO inclua uma saudação inicial (como "Olá"). Comece diretamente com uma frase como "Perfeito, {clientName}! Por favor, confirme se os dados para nosso planejamento estão corretos:".
Formate a saída em HTML. Use a tag <strong> para destacar informações chave (nome, valores, data/hora). Use <br> para quebras de linha.
O tom deve ser profissional e positivo.
Termine com a pergunta "Podemos confirmar o agendamento?".

Dados:
${JSON.stringify(leadData, null, 2)}`;

    const response = await callGenerativeApi(ai => ai.models.generateContent({
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
    'clientName', 'topic', 'creditAmount', 'monthlyInvestment',
    'clientWhatsapp', 'clientEmail', 'meetingType', 'startDatetime'
];

const getFallbackQuestions = (config: ChatConfig): Record<LeadDataKey, string> => ({
    clientName: `Olá! Eu sou ${config.assistantName}, o assistente de planejamento do ${config.consultantName}. Que ótimo ter você aqui! Para começarmos, qual o seu <strong>nome completo</strong>, por favor?`,
    topic: "Obrigado, {clientName}! Qual o seu <strong>objetivo principal</strong> com este planejamento? (Ex: <strong>Carro</strong>, <strong>Imóvel</strong>, <strong>Viagem</strong>, <strong>Investir/Planejar</strong> ou outro projeto)",
    creditAmount: "Entendi. Para este projeto, qual o <strong>valor de crédito</strong> aproximado que você está buscando?",
    monthlyInvestment: "Ótimo! Para o seu planejamento, qual seria o valor da sua <strong>reserva mensal</strong> para essa aquisição?",
    clientWhatsapp: `Perfeito. Para que ${config.consultantName} possa entrar em contato, qual o seu melhor <strong>WhatsApp com DDD</strong>?`,
    clientEmail: "E qual o seu <strong>melhor e-mail</strong> para mantermos contato?",
    meetingType: "Estamos quase lá! Você prefere uma reunião por <strong>Videochamada</strong> ou <strong>Presencial</strong>?",
    startDatetime: "Qual o melhor <strong>dia da semana</strong> para a nossa conversa?",
    finalSummary: "",
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
        if (keyToCollect === 'startDatetime' && currentData.startDatetime && !currentData.startDatetime.includes('às')) {
            updatedLeadData.startDatetime = `${currentData.startDatetime} às ${lastUserMessage}`;
        } else if (keyToCollect === 'creditAmount') {
            const numericValue = parseHumanNumber(lastUserMessage, true);
            if (!isNaN(numericValue)) updatedLeadData[keyToCollect] = numericValue;
        } else if (keyToCollect === 'monthlyInvestment') {
            const numericValue = parseHumanNumber(lastUserMessage, false);
            if (!isNaN(numericValue)) updatedLeadData[keyToCollect] = numericValue;
        } else {
            (updatedLeadData as Record<string, unknown>)[keyToCollect] = lastUserMessage;
        }
    }

    if (keyToCollect === 'startDatetime' && updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às')) {
        return {
            updatedLeadData,
            responseText: "Ótimo. E qual seria o <strong>melhor horário</strong> para você nesse dia?",
            action: null,
            nextKey: 'startDatetime'
        };
    }

    const nextKey = fallbackFlow.find(key => {
         if (key === 'startDatetime') {
            return !(updatedLeadData.startDatetime && updatedLeadData.startDatetime.includes('às'));
        }
        return !updatedLeadData.hasOwnProperty(key);
    }) || null;

    if (!nextKey) {
        return { updatedLeadData, responseText: "", action: null, nextKey: null };
    }

    const fallbackQuestions = getFallbackQuestions(config);
    let responseText = fallbackQuestions[nextKey];
    if (nextKey === 'topic' && updatedLeadData.clientName) {
        const firstName = updatedLeadData.clientName.split(' ')[0];
        responseText = responseText.replace('{clientName}', firstName);
    }

    let action = null;
    if (nextKey === 'startDatetime') {
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
    summary += `<strong>Nome:</strong> ${leadData.clientName || 'Não informado'}<br>`;
    summary += `<strong>Objetivo:</strong> ${leadData.topic || 'Não informado'}<br>`;
    summary += `<strong>Valor do Crédito:</strong> ${formatCurrency(leadData.creditAmount)}<br>`;
    summary += `<strong>Reserva Mensal:</strong> ${formatCurrency(leadData.monthlyInvestment)}<br>`;
    summary += `<strong>WhatsApp:</strong> ${leadData.clientWhatsapp || 'Não informado'}<br>`;
    summary += `<strong>E-mail:</strong> ${leadData.clientEmail || 'Não informado'}<br>`;
    summary += `<strong>Tipo de Reunião:</strong> ${leadData.meetingType || 'Não informado'}<br>`;
    summary += `<strong>Data/Hora:</strong> ${leadData.startDatetime || 'Não informado'}<br><br>`;
    summary += "Podemos confirmar o agendamento?";

    return summary;
}

const getInternalSummaryForCRM = async (leadData: Partial<LeadData>, history: Message[], formattedCreditAmount: string, formattedMonthlyInvestment: string, consultantName: string): Promise<string> => {
    const conversationHistory = history.map(m => `${m.sender === 'bot' ? 'Assistente' : 'Cliente'}: ${m.text.replace(/<[^>]*>/g, '')}`).join('\n');

    const dataForPrompt = {
        ...leadData,
        creditAmount: formattedCreditAmount,
        monthlyInvestment: formattedMonthlyInvestment
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
        const response = await callGenerativeApi(ai => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: internalSummaryPrompt,
        }));
        return response.text.trim();
    } catch (error) {
        console.error("Failed to generate internal CRM summary:", error);
        return "Não foi possível gerar o relatório narrativo da conversa.";
    }
};


export const sendLeadToCRM = async (leadData: Partial<LeadData>, history: Message[], config: ChatConfig) => {
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

    const { clientName, clientWhatsapp, clientEmail, topic, creditAmount = 0, monthlyInvestment = 0, startDatetime, source, finalSummary, meetingType } = leadData;

    const formattedCreditAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creditAmount);
    const formattedMonthlyInvestment = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyInvestment);

    const narrativeReport = await getInternalSummaryForCRM(leadData, history, formattedCreditAmount, formattedMonthlyInvestment, consultantName);

    let notesContent = `Lead: ${currentLeadNumber}\n\n`;
    notesContent += "RELATÓRIO DA CONVERSA (IA):\n";
    notesContent += `${narrativeReport}\n\n`;
    notesContent += "--------------------------------------\n\n";
    notesContent += "DADOS CAPTURADOS:\n";
    notesContent += `Origem: ${source || 'Direto'}\n`;
    notesContent += `Nome do Cliente: ${clientName}\n`;
    notesContent += `WhatsApp: ${clientWhatsapp || 'Não informado'}\n`;
    notesContent += `E-mail: ${clientEmail || 'Não informado'}\n`;
    notesContent += `Objetivo do Projeto: ${topic}\n`;
    notesContent += `Valor do Crédito: ${formattedCreditAmount}\n`;
    notesContent += `Reserva Mensal: ${formattedMonthlyInvestment}\n`;
    notesContent += `Agendamento Preferencial: ${startDatetime || 'Não informado'}\n\n`;
    
    if (startDatetime) {
        const timeMatch = startDatetime.match(/\b(\d{1,2}):(\d{2})\b/);
        if (timeMatch) {
            const hour = parseInt(timeMatch[1], 10);
            if (hour < 6 || hour >= 22) {
                notesContent += "ATENÇÃO: Horário de agendamento fora do padrão comercial. Recomenda-se ligar para confirmar.\n";
            }
        }
    }

    const requestBody = {
        nome: clientName,
        email: clientEmail || 'nao-informado@lead.com',
        celular: (clientWhatsapp || '').replace(/\D/g, ''),
        cpf_ou_cnpj: "000.000.000-00",
        classificacao1: `Projeto: ${topic}`,
        classificacao2: `${formattedCreditAmount}`,
        classificacao3: `Reserva Mensal: ${formattedMonthlyInvestment}`,
        obs: notesContent,
        platform: "GEMSID",
        consultantName,
        final_summary: finalSummary,
        start_datetime: startDatetime,
        meeting_type: meetingType,
    };

    try {
        const response = await fetch(MAKE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        console.log("Lead enviado para o CRM:", requestBody);
        if (!response.ok) {
            console.error("Erro na resposta do CRM:", response.status, response.statusText);
            const responseBody = await response.text();
            console.error("Corpo da resposta do CRM:", responseBody);
            throw new Error(`CRM submission failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao enviar para o CRM:", error);
        throw error;
    }
};
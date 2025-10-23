import { GoogleGenAI, Type } from "@google/genai";
import { Message, LeadData, LeadDataKey } from "../types";

const MAKE_URL = "https://hook.us2.make.com/ud4aq9lrms2mfpce40ur6ac1papv68fi";
const PRIMARY_API_KEY = "AIzaSyBdyZUMEdkxSCSXF-X3KnrRjnKt9e7yEXM";
const SECONDARY_API_KEY = "AIzaSyAr-ZhYtdZ-b3jzXvIUjANB0A5dQSxHcV4";

const getAiClient = (apiKey: string | undefined) => {
    if (!apiKey) {
        throw new Error("API key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

const systemPrompt = `
Você é Yannis, um assistente de pré-consultoria amigável, profissional e muito eficiente para Sidinei Lara, um consultor da Ademicon. Sua única função é coletar as informações necessárias de um potencial cliente para agendar uma reunião. Siga estritamente estas regras:

1.  **Contexto e Início**: Se o bloco \`[CONTEXTO]\` estiver vazio, sua primeira pergunta DEVE ser para obter o \`client_name\`. Caso contrário, use o contexto para determinar qual é o próximo dado que falta coletar.

2.  **Fluxo de Conversa**: Siga uma conversa natural para obter as seguintes informações, UMA DE CADA VEZ, na seguinte ordem estrita:
    *   \`client_name\`
    *   \`topic\`
    *   \`valor_credito\`
    *   \`reserva_mensal\`
    *   \`client_whatsapp\`
    *   \`client_email\`
    *   \`meeting_type\`
    *   \`start_datetime\` (Pergunte primeiro o dia, depois a hora)

3.  **Interação**:
    *   Faça apenas UMA pergunta por vez.
    *   Seja breve, amigável e direto. Use palavras como "planejamento", "objetivo", "projeto".
    *   Use **negrito** (usando a tag \`<strong>\`) para destacar a informação que você está pedindo.
    *   Se o usuário fizer uma pergunta ou objeção, responda de forma concisa e volte imediatamente para a pergunta que estava pendente no fluxo.
    *   Se a última mensagem do usuário for um dia da semana (ex: "Segunda-feira"), sua próxima pergunta DEVE ser sobre o **horário**.

4.  **Saída JSON**:
    *   Sua resposta DEVE ser um objeto JSON válido.
    *   O JSON deve conter o campo "responseText", que é a sua mensagem para o usuário.
    *   O JSON deve conter "nextKey", indicando qual a próxima informação a ser coletada no fluxo. Se todas as informações foram coletadas, retorne null para "nextKey".
    *   O JSON deve conter APENAS os campos de dados do lead que você conseguiu extrair da ÚLTIMA resposta do usuário. NÃO inclua campos que você já tinha.

5.  **Ações da Interface**:
    *   Quando for a hora de perguntar sobre o \`start_datetime\` (e somente nesse momento), sua primeira pergunta deve ser APENAS sobre o dia da semana. Neste caso, sua resposta JSON DEVE incluir o campo \`action: 'SHOW_DAY_OPTIONS'\` e a \`nextKey\` deve ser \`start_datetime\`.
`;

const leadDataSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: { type: Type.STRING, description: "A resposta em texto para ser exibida ao usuário." },
        nextKey: { type: Type.STRING, nullable: true, description: "A chave do próximo dado a ser coletado (ex: 'client_name', 'topic'). Retorne null se tudo foi coletado." },
        client_name: { type: Type.STRING, description: "Nome completo do cliente." },
        topic: { type: Type.STRING, enum: ['Imóvel', 'Automóvel', 'Investimento', 'Viagem', 'Outro'], description: "O objetivo principal do cliente." },
        valor_credito: { type: Type.NUMBER, description: "O valor total do crédito ou projeto." },
        reserva_mensal: { type: Type.NUMBER, description: "O valor que o cliente pode investir mensalmente." },
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

// Helper function for retrying with exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callApiWithRetry = async <T>(apiFn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await apiFn();
        } catch (error: any) {
            lastError = error;
            const errorMessage = error.toString().toLowerCase();
            // Only retry on specific transient errors (like overload)
            if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('unavailable')) {
                 if (i < retries - 1) {
                    const waitTime = delay * Math.pow(2, i);
                    console.log(`API call failed due to overload, retrying in ${waitTime}ms...`);
                    await sleep(waitTime);
                }
            } else {
                // Not a retryable error, throw immediately
                throw lastError;
            }
        }
    }
    throw lastError;
};

const callApiWithFallback = async (apiCall: (ai: GoogleGenAI) => Promise<any>) => {
    try {
        const primaryAi = getAiClient(PRIMARY_API_KEY);
        return await callApiWithRetry(() => apiCall(primaryAi));
    } catch (primaryError) {
        console.warn("Primary API key failed after retries. Trying fallback.", primaryError);
        try {
            const secondaryAi = getAiClient(SECONDARY_API_KEY);
            return await callApiWithRetry(() => apiCall(secondaryAi));
        } catch (secondaryError) {
            console.error("Fallback API key also failed after retries.", secondaryError);
            throw new Error("Both API keys failed.");
        }
    }
};

export const getAiResponse = async (
    history: Message[],
    currentData: Partial<LeadData>,
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

    const response = await callApiWithFallback(ai => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            systemInstruction: systemPrompt,
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

export const getFinalSummary = async (leadData: Partial<LeadData>): Promise<string> => {
    const summaryPrompt = `Crie um resumo de confirmação conciso para um agendameto com base nos dados JSON a seguir.
NÃO inclua uma saudação inicial (como "Olá"). Comece diretamente com uma frase como "Perfeito! Por favor, confirme se os dados abaixo estão corretos:".
Formate a saída em HTML. Use a tag <strong> para destacar informações chave (nome, valores, data/hora). Use <br> para quebras de linha.
O tom deve ser profissional e positivo.
Termine com a pergunta "Podemos confirmar o agendamento?".

Dados:
${JSON.stringify(leadData, null, 2)}`;

    const response = await callApiWithFallback(ai => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: summaryPrompt,
    }));
    
    const formattedSummary = response.text.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formattedSummary;
};

// --- Fallback Logic (Non-AI) ---
const fallbackFlow: LeadDataKey[] = [
    'client_name', 'topic', 'valor_credito', 'reserva_mensal',
    'client_whatsapp', 'client_email', 'meeting_type', 'start_datetime'
];

const fallbackQuestions: Record<LeadDataKey, string> = {
    client_name: "Para começar, qual é o seu <strong>nome completo</strong>?",
    topic: "Qual o seu <strong>principal objetivo</strong> com o consórcio? (Ex: Imóvel, Automóvel, etc.)",
    valor_credito: "Qual o <strong>valor do crédito</strong> que você precisa?",
    reserva_mensal: "E qual valor você consegue <strong>investir por mês</strong> neste projeto?",
    client_whatsapp: "Qual o seu número de <strong>WhatsApp com DDD</strong> para contato?",
    client_email: "E qual o seu <strong>melhor e-mail</strong> para mantermos contato?",
    meeting_type: "Você prefere uma reunião por <strong>Videochamada</strong> ou <strong>Presencial</strong>?",
    start_datetime: "Qual o melhor <strong>dia da semana</strong> para a nossa conversa?",
    final_summary: "",
    source: ""
};


export const getFallbackResponse = (
    lastUserMessage: string,
    currentData: Partial<LeadData>,
    keyToCollect: LeadDataKey | null
): AiResponse => {
    let updatedLeadData = { ...currentData };
    if (keyToCollect && lastUserMessage) {
        if (keyToCollect === 'start_datetime' && currentData.start_datetime && !currentData.start_datetime.includes('às')) {
            updatedLeadData.start_datetime = `${currentData.start_datetime} às ${lastUserMessage}`;
        } else if (keyToCollect === 'valor_credito' || keyToCollect === 'reserva_mensal') {
            const numericValue = parseFloat(lastUserMessage.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
            if (!isNaN(numericValue)) {
                updatedLeadData[keyToCollect] = numericValue;
            }
        } else {
            (updatedLeadData as Record<string, unknown>)[keyToCollect] = lastUserMessage;
        }
    }

    const nextKey = fallbackFlow.find(key => !updatedLeadData.hasOwnProperty(key)) || null;

    if (!nextKey) {
        return { updatedLeadData, responseText: "", action: null, nextKey: null };
    }
    
    const responseText = fallbackQuestions[nextKey];
    let action = null;

    if (nextKey === 'start_datetime' && !lastUserMessage.toLowerCase().includes('feira') && !lastUserMessage.toLowerCase().includes('sábado') && !lastUserMessage.toLowerCase().includes('domingo')) {
        action = 'SHOW_DAY_OPTIONS';
    } else if (keyToCollect === 'start_datetime' && updatedLeadData.start_datetime && !updatedLeadData.start_datetime.includes('às')) {
         return {
            updatedLeadData,
            responseText: "Ótimo. E qual seria o <strong>melhor horário</strong> para você nesse dia?",
            action: null,
            nextKey: 'start_datetime'
         }
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

const getInternalSummaryForCRM = async (leadData: LeadData, history: Message[], formattedValorCredito: string, formattedReservaMensal: string): Promise<string> => {
    const conversationHistory = history.map(m => `${m.sender === 'bot' ? 'Assistente' : 'Cliente'}: ${m.text.replace(/<[^>]*>/g, '')}`).join('\n');

    const dataForPrompt = {
        ...leadData,
        valor_credito: formattedValorCredito,
        reserva_mensal: formattedReservaMensal
    };

    const internalSummaryPrompt = `
    Você é um analista de vendas. Sua tarefa é criar um relatório narrativo conciso para um consultor com base em um resumo de dados e no histórico da conversa com um assistente de IA.

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
        const response = await callApiWithFallback(ai => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: internalSummaryPrompt,
        }));
        return response.text.trim();
    } catch (error) {
        console.error("Failed to generate internal CRM summary:", error);
        return "Não foi possível gerar o relatório narrativo da conversa.";
    }
};


export const sendLeadToCRM = async (leadData: LeadData, history: Message[]) => {
    const { client_name, client_whatsapp, client_email, topic, valor_credito, reserva_mensal, start_datetime, source } = leadData;

    const formattedValorCredito = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor_credito);
    const formattedReservaMensal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reserva_mensal);

    const narrativeReport = await getInternalSummaryForCRM(leadData, history, formattedValorCredito, formattedReservaMensal);

    let obsContent = "RELATÓRIO DA CONVERSA (IA):\n";
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
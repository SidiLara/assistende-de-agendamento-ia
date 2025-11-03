import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Mensagem, RemetenteMensagem } from "../chat/modelos/MensagemModel";
import { Lead } from "../chat/modelos/LeadModel";
import { ConfiguracaoChat } from "../chat/modelos/ConfiguracaoChatModel";
import { RespostaAi } from "../chat/modelos/RespostaAi";
import { createSystemPrompt, leadDataSchema, createFinalSummaryPrompt, createInternalSummaryPrompt } from "../chat/ChatPrompts";
import { IGeminiApiService } from "./InterfacesApi";

export class ServicoGeminiApi implements IGeminiApiService {
    private apiKeys: string[];

    constructor() {
        const keysString = import.meta.env.VITE_GEMINI_API_KEYS || "";
        this.apiKeys = keysString.split(',').map(key => key.trim()).filter(Boolean);

        if (this.apiKeys.length === 0) {
            console.warn("Nenhuma Chave de API do Gemini foi encontrada. O aplicativo será executado em modo de fallback. Certifique-se de que a variável de ambiente VITE_GEMINI_API_KEYS está configurada.");
        }
    }

    private async callGenerativeApi<T>(apiFn: (ai: GoogleGenAI) => Promise<T>): Promise<T> {
        if (this.apiKeys.length === 0) {
            throw new Error("O serviço de IA não foi inicializado. Nenhuma Chave de API está configurada no ambiente.");
        }

        let lastError: any;

        for (const key of this.apiKeys) {
            try {
                const ai = new GoogleGenAI({ apiKey: key });
                const result = await apiFn(ai);
                return result;
            } catch (error: any) {
                lastError = error;
                console.warn(`A chamada da API falhou com a chave finalizada em '...${key.slice(-4)}'. Tentando a próxima chave.`);
            }
        }
        
        console.error("A chamada da API falhou com todas as chaves disponíveis.", lastError);
        throw new Error("A chamada da API falhou, mudando para o script local.");
    }
    
    public async generateAiResponse(history: Mensagem[], currentData: Partial<Lead>, config: ConfiguracaoChat): Promise<RespostaAi> {
        const contextMessage = `[CONTEXTO] Dados já coletados: ${JSON.stringify(currentData)}. Analise o histórico e o contexto para determinar a próxima pergunta.`;
        
        const contents: {role: 'user' | 'model', parts: {text: string}[]}[] = [{
            role: 'user',
            parts: [{ text: contextMessage }]
        }];

        for (const msg of history) {
            contents.push({
                role: msg.sender === RemetenteMensagem.User ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        }
        
        const systemInstruction = createSystemPrompt(config.assistantName, config.consultantName);

        const response: GenerateContentResponse = await this.callGenerativeApi((ai) => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: leadDataSchema
            }
        }));

        const jsonText = response.text;
        if (!jsonText) {
            console.error("A resposta do Gemini veio vazia e não pode ser analisada.");
            throw new Error("A resposta da IA veio vazia.");
        }
        try {
            const parsedJson = JSON.parse(jsonText);
            const { responseText, action, nextKey, ...updatedLeadData } = parsedJson;
            
            const formattedText = (responseText || "Desculpe, não entendi. Pode repetir?")
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            const sanitizedText = formattedText
                .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
                .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');

            return {
                updatedLeadData,
                responseText: sanitizedText,
                action: action || null,
                nextKey: nextKey || null
            };
        } catch (e) {
            console.error("Falha ao analisar a resposta JSON do Gemini:", jsonText, e);
            throw new Error("Falha na análise do JSON");
        }
    }

    public async generateFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string> {
        const summaryPrompt = createFinalSummaryPrompt(leadData, config);

        const response: GenerateContentResponse = await this.callGenerativeApi((ai) => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: summaryPrompt,
        }));

        return response.text?.trim() ?? "Não foi possível gerar o resumo. Por favor, confirme os dados.";
    }
    
    public async generateInternalSummary(leadData: Partial<Lead>, history: Mensagem[], formattedCreditAmount: string, formattedMonthlyInvestment: string, consultantName: string): Promise<string> {
        const internalSummaryPrompt = createInternalSummaryPrompt(leadData, history, formattedCreditAmount, formattedMonthlyInvestment, consultantName);
        
        try {
            const response: GenerateContentResponse = await this.callGenerativeApi((ai) => ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: internalSummaryPrompt,
            }));

            const summary = response.text?.trim();
            if (!summary) {
                throw new Error("O resumo interno retornado pela IA estava vazio.");
            }
            return summary;

        } catch (error) {
            console.error("Falha ao gerar o resumo interno do CRM:", error);
            return "Não foi possível gerar o relatório narrativo da conversa.";
        }
    }
}
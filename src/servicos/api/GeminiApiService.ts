import { GoogleGenAI } from "@google/genai";
import { Mensagem, RemetenteMensagem } from "../chat/modelos/MensagemModel";
import { Lead } from "../chat/modelos/LeadModel";
import { ConfiguracaoChat } from "../chat/modelos/ConfiguracaoChatModel";
import { RespostaAi } from "../chat/modelos/AiResponse";
import { createSystemPrompt, leadDataSchema, createFinalSummaryPrompt, createInternalSummaryPrompt } from "../chat/ChatPrompts";
import { IGeminiApiService } from "./ApiInterfaces";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GeminiApiService implements IGeminiApiService {
    private ai?: GoogleGenAI;

    constructor() {
        // FIX: Use process.env.API_KEY as per guidelines.
        const apiKey = process.env.API_KEY;
        if (apiKey) {
            this.ai = new GoogleGenAI({ apiKey });
        } else {
            // FIX: Updated warning message to reference API_KEY.
            console.warn("Chave de API do Gemini não encontrada. O aplicativo será executado em modo de fallback. Certifique-se de que a variável de ambiente API_KEY está configurada.");
        }
    }

    private async callApiWithRetry<T>(apiFn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
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
                        console.warn(`A chamada da API falhou com um erro transiente, tentando novamente em ${waitTime}ms...`);
                        await sleep(waitTime);
                    }
                } else {
                    throw lastError;
                }
            }
        }
        throw lastError;
    }

    private async callGenerativeApi(apiFn: () => Promise<any>) {
        if (!this.ai) {
            // FIX: Updated error message to reference API_KEY.
            throw new Error("O serviço de IA não foi inicializado. Verifique se a Chave de API (API_KEY) está configurada no ambiente.");
        }
        try {
            return await this.callApiWithRetry(apiFn);
        } catch (error) {
            console.error("A chamada da API falhou após as tentativas.", error);
            throw new Error("A chamada da API falhou, mudando para o script local.");
        }
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

        const response = await this.callGenerativeApi(() => this.ai!.models.generateContent({
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

        const response = await this.callGenerativeApi(() => this.ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: summaryPrompt,
        }));

        return response.text.trim();
    }
    
    public async generateInternalSummary(leadData: Partial<Lead>, history: Mensagem[], formattedCreditAmount: string, formattedMonthlyInvestment: string, consultantName: string): Promise<string> {
        const internalSummaryPrompt = createInternalSummaryPrompt(leadData, history, formattedCreditAmount, formattedMonthlyInvestment, consultantName);
        
        try {
            const response = await this.callGenerativeApi(() => this.ai!.models.generateContent({
                model: "gemini-2.5-flash",
                contents: internalSummaryPrompt,
            }));
            return response.text.trim();
        } catch (error) {
            console.error("Falha ao gerar o resumo interno do CRM:", error);
            return "Não foi possível gerar o relatório narrativo da conversa.";
        }
    }
}
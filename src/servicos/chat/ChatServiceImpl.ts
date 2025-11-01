import { GoogleGenAI } from "@google/genai";
import { Mensagem, RemetenteMensagem } from "./modelos/MensagemModel";
import { Lead, LeadKey } from "./modelos/LeadModel";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { ServicoChat } from "./ChatService";
import { RespostaAi } from "./modelos/AiResponse";
import { RegraFallback } from "./FallbackRule";
import { createSystemPrompt, leadDataSchema, createFinalSummaryPrompt, createInternalSummaryPrompt } from "./ChatPrompts";

const BASE_MAKE_URL = "https://hook.us2.make.com/";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ServicoChatImpl implements ServicoChat {
    private fallbackRule: RegraFallback;
    private ai?: GoogleGenAI;

    constructor(fallbackRule: RegraFallback) {
        this.fallbackRule = fallbackRule;
        // FIX: Per Gemini API guidelines, initialize with process.env.API_KEY directly.
        const apiKey = process.env.API_KEY;
        if (apiKey) {
            this.ai = new GoogleGenAI({ apiKey });
        } else {
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
                        console.warn(`API call failed due to transient error, retrying in ${waitTime}ms...`);
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
            // FIX: Updated error message to reflect new API key handling.
            throw new Error("O serviço de IA não foi inicializado. Verifique se a Chave de API (API_KEY) está configurada no ambiente.");
        }
        try {
            return await this.callApiWithRetry(apiFn);
        } catch (error) {
            console.error("API call failed after retries.", error);
            throw new Error("API call failed, switching to local script.");
        }
    }
    
    private async getInternalSummaryForCRM(leadData: Partial<Lead>, history: Mensagem[], formattedCreditAmount: string, formattedMonthlyInvestment: string, consultantName: string): Promise<string> {
        const internalSummaryPrompt = createInternalSummaryPrompt(leadData, history, formattedCreditAmount, formattedMonthlyInvestment, consultantName);
        
        try {
            const response = await this.callGenerativeApi(() => this.ai!.models.generateContent({
                model: "gemini-2.5-flash",
                contents: internalSummaryPrompt,
            }));
            return response.text.trim();
        } catch (error) {
            console.error("Failed to generate internal CRM summary:", error);
            return "Não foi possível gerar o relatório narrativo da conversa.";
        }
    }

    public async getAiResponse(
        history: Mensagem[],
        currentData: Partial<Lead>,
        config: ConfiguracaoChat
    ): Promise<RespostaAi> {
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
    }

    public async getFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string> {
        const summaryPrompt = createFinalSummaryPrompt(leadData, config);

        const response = await this.callGenerativeApi(() => this.ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: summaryPrompt,
        }));

        return response.text.trim();
    }

    public getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<Lead>,
        keyToCollect: LeadKey | null,
        config: ConfiguracaoChat
    ): RespostaAi {
        return this.fallbackRule.getFallbackResponse(lastUserMessage, currentData, keyToCollect, config);
    }

    public getFallbackSummary(leadData: Partial<Lead>): string {
        return this.fallbackRule.getFallbackSummary(leadData);
    }

    public async sendLeadToCRM(leadData: Partial<Lead>, history: Mensagem[], config: ConfiguracaoChat) {
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

        const narrativeReport = await this.getInternalSummaryForCRM(leadData, history, formattedCreditAmount, formattedMonthlyInvestment, consultantName);

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
    }
}
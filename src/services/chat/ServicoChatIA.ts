import { Mensagem } from "./modelos/MensagemModel";
import { Lead, LeadKey } from "./modelos/LeadModel";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { RespostaAi } from "./modelos/RespostaAi";
import { SendCrmOptions } from "./InterfacesChat";
import { ServicoChat } from "./ServicoChat";
import { criarPromptSistema, criarPromptUsuario, criarPromptResumoFinal } from './prompts';

export class ServicoChatIA implements ServicoChat {
    private readonly apiKey: string;
    private readonly apiUrl: string;

    constructor(apiKey: string, apiUrl: string = 'https://api.openai.com/v1/chat/completions') {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }

    private async callApi(messages: any[]): Promise<any> {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: messages,
                temperature: 0.2,
                max_tokens: 300,
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch from OpenAI API');
        }
        return response.json();
    }

    private parseApiResponse(response: any): RespostaAi {
        try {
            const parsedContent = JSON.parse(response.choices[0].message.content);
            return {
                updatedLeadData: parsedContent.leadData || {},
                responseText: parsedContent.response,
                action: parsedContent.action || null,
                nextKey: parsedContent.nextKey || null,
            };
        } catch (error) {
            console.error("Error parsing AI response:", error);
            return {
                updatedLeadData: {},
                responseText: "Ocorreu um erro ao processar a resposta. Vamos tentar de novo.",
                action: null,
                nextKey: null,
            };
        }
    }

    public async getAiResponse(history: Mensagem[], currentData: Partial<Lead>, config: ConfiguracaoChat): Promise<RespostaAi> {
        const systemPrompt = criarPromptSistema(config, currentData);
        const userPrompt = criarPromptUsuario(history);
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ];
        const apiResponse = await this.callApi(messages);
        return this.parseApiResponse(apiResponse);
    }

    public async getFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string> {
        const summaryPrompt = criarPromptResumoFinal(config, leadData);
        const messages = [{ role: "system", content: summaryPrompt }];
        const apiResponse = await this.callApi(messages);
        return apiResponse.choices[0].message.content;
    }

    public getFallbackResponse(lastUserMessage: string, currentData: Partial<Lead>, keyToCollect: LeadKey | null, config: ConfiguracaoChat): RespostaAi {
        throw new Error("Fallback response is not available in AI mode.");
    }

    public getFallbackSummary(leadData: Partial<Lead>): string {
        throw new Error("Fallback summary is not available in AI mode.");
    }

    public async sendLeadToCRM(leadData: Partial<Lead>, history: Mensagem[], config: ConfiguracaoChat, options: SendCrmOptions): Promise<void> {
        console.log("AI mode: Lead sent to CRM with data:", { leadData, history, config, options });
        return;
    }
}
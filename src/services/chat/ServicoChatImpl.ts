import { Mensagem } from "./modelos/MensagemModel";
import { Lead } from "./modelos/LeadModel";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { ServicoChat } from "./ServicoChat";
import { SendCrmOptions } from "./InterfacesChat";
import { RespostaAi } from "./modelos/RespostaAi";
import { RegraFallback } from "./RegraFallback";
import { ServicoCrmApi } from "../api/ServicoCrmApi";
import { ServicoGeminiApi } from "../api/ServicoGeminiApi";

export class ServicoChatImpl implements ServicoChat {
    private fallbackRule: RegraFallback;
    private geminiApi: ServicoGeminiApi;
    private crmApi: ServicoCrmApi;

    constructor(fallbackRule: RegraFallback, geminiApi: ServicoGeminiApi, crmApi: ServicoCrmApi) {
        this.fallbackRule = fallbackRule;
        this.geminiApi = geminiApi;
        this.crmApi = crmApi;
    }
    
    public async getAiResponse(
        history: Mensagem[],
        currentData: Partial<Lead>,
        config: ConfiguracaoChat
    ): Promise<RespostaAi> {
        return await this.geminiApi.gerarRespostaAi(history, currentData, config);
    }

    public async getFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string> {
        return await this.geminiApi.gerarResumoFinal(leadData, config);
    }

    public getFallbackResponse(...args: Parameters<RegraFallback['getFallbackResponse']>): RespostaAi {
        return this.fallbackRule.getFallbackResponse(...args);
    }

    public getFallbackSummary(leadData: Partial<Lead>): string {
        return this.fallbackRule.getFallbackSummary(leadData);
    }

    public async sendLeadToCRM(leadData: Partial<Lead>, history: Mensagem[], config: ConfiguracaoChat, options: SendCrmOptions) {
        const { consultantName } = config;
        const { creditAmount = 0, monthlyInvestment = 0 } = leadData;

        const formattedCreditAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creditAmount);
        const formattedMonthlyInvestment = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyInvestment);
        
        let narrativeReport: string;

        if (options.isFallback) {
            const project = leadData.topic || '(não informado)';
            narrativeReport = `Cliente quer fazer ${project}, precisa de ${formattedCreditAmount} e consegue pagar até ${formattedMonthlyInvestment} por mês.`;
            
            const uniqueObjections = [...new Set(options.objections)];
            if (uniqueObjections.length > 0) {
                narrativeReport += ` Teve algumas objeções: ${uniqueObjections.join(', ')}.`;
            }
        } else {
            narrativeReport = await this.geminiApi.gerarResumoInterno(leadData, history, formattedCreditAmount, formattedMonthlyInvestment, consultantName);
        }

        await this.crmApi.enviarLead(leadData, narrativeReport, config);
    }
}
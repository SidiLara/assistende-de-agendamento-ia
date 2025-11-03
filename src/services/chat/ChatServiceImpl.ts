import { Mensagem } from "./models/MensagemModel";
import { Lead } from "./models/LeadModel";
import { ConfiguracaoChat } from "./models/ConfiguracaoChatModel";
import { ServicoChat } from "./ServicoChat";
import { SendCrmOptions } from "./InterfacesChat";
import { RespostaAi } from "./models/RespostaAi";
import { RegraFallback } from "./RegraFallback";
import { baseDeConhecimento } from "./conhecimento/BaseDeConhecimento";
import { getFallbackQuestions, fallbackFlow } from "./ConfiguracaoFallback";
import { ICrmApiService, IGeminiApiService } from "../api/InterfacesApi";

export class ServicoChatImpl implements ServicoChat {
    private fallbackRule: RegraFallback;
    private geminiApi: IGeminiApiService;
    private crmApi: ICrmApiService;

    constructor(fallbackRule: RegraFallback, geminiApi: IGeminiApiService, crmApi: ICrmApiService) {
        this.fallbackRule = fallbackRule;
        this.geminiApi = geminiApi;
        this.crmApi = crmApi;
    }
    
    public async getAiResponse(
        history: Mensagem[],
        currentData: Partial<Lead>,
        config: ConfiguracaoChat
    ): Promise<RespostaAi> {
        const lastUserMessage = history[history.length - 1]?.text.toLowerCase() || '';
        if (lastUserMessage) {
            for (const objecao of baseDeConhecimento) {
                for (const palavra of objecao.palavrasChave) {
                    if (lastUserMessage.includes(palavra)) {
                        const fallbackQuestions = getFallbackQuestions(config);
                        const nextKeyToAsk = fallbackFlow.find(key => !currentData.hasOwnProperty(key)) || 'clientName';
                        let nextQuestion = fallbackQuestions[nextKeyToAsk];
                        
                        if (nextQuestion.includes('{clientName}') && currentData.clientName) {
                            nextQuestion = nextQuestion.replace('{clientName}', currentData.clientName.split(' ')[0]);
                        }
                        
                        const responseText = `${objecao.resposta} Para continuarmos, ${nextQuestion.charAt(0).toLowerCase() + nextQuestion.slice(1)}`;
                        
                        // FIX: Removed 'triggeredObjectionText' as it does not exist on the 'RespostaAi' type.
                        return {
                            updatedLeadData: {},
                            responseText,
                            action: nextKeyToAsk === 'startDatetime' ? 'SHOW_DAY_OPTIONS' : null,
                            nextKey: nextKeyToAsk,
                        };
                    }
                }
            }
        }
        
        return await this.geminiApi.generateAiResponse(history, currentData, config);
    }

    public async getFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string> {
        return await this.geminiApi.generateFinalSummary(leadData, config);
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
            narrativeReport = await this.geminiApi.generateInternalSummary(leadData, history, formattedCreditAmount, formattedMonthlyInvestment, consultantName);
        }

        await this.crmApi.sendLead(leadData, narrativeReport, config);
    }
}
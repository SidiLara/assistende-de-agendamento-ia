import { Mensagem } from "../chat/models/MensagemModel";
import { Lead } from "../chat/models/LeadModel";
import { ConfiguracaoChat } from "../chat/models/ConfiguracaoChatModel";
import { RespostaAi } from "../chat/models/RespostaAi";

export interface IGeminiApiService {
    generateAiResponse(history: Mensagem[], currentData: Partial<Lead>, config: ConfiguracaoChat): Promise<RespostaAi>;
    generateFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string>;
    generateInternalSummary(leadData: Partial<Lead>, history: Mensagem[], formattedCreditAmount: string, formattedMonthlyInvestment: string, consultantName: string): Promise<string>;
}

export interface ICrmApiService {
    sendLead(leadData: Partial<Lead>, narrativeReport: string, config: ConfiguracaoChat): Promise<void>;
}

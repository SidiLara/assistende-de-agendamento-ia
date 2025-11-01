import { Mensagem } from "../chat/modelos/MensagemModel";
import { Lead } from "../chat/modelos/LeadModel";
import { ConfiguracaoChat } from "../chat/modelos/ConfiguracaoChatModel";
import { RespostaAi } from "../chat/modelos/AiResponse";

export interface IGeminiApiService {
    generateAiResponse(history: Mensagem[], currentData: Partial<Lead>, config: ConfiguracaoChat): Promise<RespostaAi>;
    generateFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string>;
    generateInternalSummary(leadData: Partial<Lead>, history: Mensagem[], formattedCreditAmount: string, formattedMonthlyInvestment: string, consultantName: string): Promise<string>;
}

export interface ICrmApiService {
    sendLead(leadData: Partial<Lead>, narrativeReport: string, config: ConfiguracaoChat): Promise<void>;
}
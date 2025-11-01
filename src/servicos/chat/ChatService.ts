import { Mensagem } from "./modelos/MensagemModel";
import { Lead, LeadKey } from "./modelos/LeadModel";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { RespostaAi } from "./modelos/AiResponse";
import { SendCrmOptions } from "./ChatInterfaces";

export interface ServicoChat {
    getAiResponse(history: Mensagem[], currentData: Partial<Lead>, config: ConfiguracaoChat): Promise<RespostaAi>;
    getFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string>;
    getFallbackResponse(lastUserMessage: string, currentData: Partial<Lead>, keyToCollect: LeadKey | null, config: ConfiguracaoChat): RespostaAi;
    getFallbackSummary(leadData: Partial<Lead>): string;
    sendLeadToCRM(leadData: Partial<Lead>, history: Mensagem[], config: ConfiguracaoChat, options: SendCrmOptions): Promise<void>;
    generateSpeech(text: string): Promise<string | null>;
}
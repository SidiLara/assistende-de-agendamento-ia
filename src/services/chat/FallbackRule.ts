import { RespostaAi } from "./modelos/AiResponse";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { Lead, LeadKey } from "./modelos/LeadModel";

export interface RegraFallback {
    getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<Lead>,
        keyToCollect: LeadKey | null,
        config: ConfiguracaoChat
    ): RespostaAi;

    getFallbackSummary(leadData: Partial<Lead>): string;
}
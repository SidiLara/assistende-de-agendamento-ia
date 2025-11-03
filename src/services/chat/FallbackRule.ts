import { RespostaAi } from "./models/AiResponse";
import { ConfiguracaoChat } from "./models/ConfiguracaoChatModel";
import { Lead, LeadKey } from "./models/LeadModel";

export interface RegraFallback {
    getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<Lead>,
        keyToCollect: LeadKey | null,
        config: ConfiguracaoChat
    ): RespostaAi;

    getFallbackSummary(leadData: Partial<Lead>): string;
}
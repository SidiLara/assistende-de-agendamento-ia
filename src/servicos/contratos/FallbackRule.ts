import { AiResponse } from "../modelos/Chat.response";
import { ChatConfig } from "../modelos/ConfiguracaoChat.model";
import { LeadData, LeadDataKey } from "../modelos/Lead.model";

export interface FallbackRule {
    getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<LeadData>,
        keyToCollect: LeadDataKey | null,
        config: ChatConfig
    ): AiResponse;

    getFallbackSummary(leadData: Partial<LeadData>): string;
}

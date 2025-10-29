import { AiResponse } from "../modelos/Chat.response";
import { ChatConfig } from "../modelos/ConfiguracaoChatModel";
import { LeadData, LeadDataKey } from "../modelos/LeadModel";

export interface FallbackRule {
    getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<LeadData>,
        keyToCollect: LeadDataKey | null,
        config: ChatConfig
    ): AiResponse;

    getFallbackSummary(leadData: Partial<LeadData>): string;
}

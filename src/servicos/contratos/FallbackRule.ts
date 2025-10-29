import { AiResponse } from "../modelos/ChatResponse";
import { ChatConfig } from "../modelos/ConfiguracaoChat";
import { LeadData, LeadDataKey } from "../modelos/Lead";

export interface FallbackRule {
    getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<LeadData>,
        keyToCollect: LeadDataKey | null,
        config: ChatConfig
    ): AiResponse;

    getFallbackSummary(leadData: Partial<LeadData>): string;
}

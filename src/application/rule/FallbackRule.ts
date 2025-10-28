import { AiResponse } from "../../dto/response/chat/ChatResponse";
import { ChatConfig } from "../../model/configuracao/ConfiguracaoChatModel";
import { LeadData, LeadDataKey } from "../../model/lead/LeadModel";

export interface FallbackRule {
    getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<LeadData>,
        keyToCollect: LeadDataKey | null,
        config: ChatConfig
    ): AiResponse;

    getFallbackSummary(leadData: Partial<LeadData>): string;
}

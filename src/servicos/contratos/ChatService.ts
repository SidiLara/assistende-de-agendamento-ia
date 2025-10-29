import { Message } from "../modelos/MensagemModel";
import { LeadData, LeadDataKey } from "../modelos/LeadModel";
import { ChatConfig } from "../modelos/ConfiguracaoChatModel";
import { AiResponse } from "../modelos/Chat.response";

export interface ChatService {
    getAiResponse(history: Message[], currentData: Partial<LeadData>, config: ChatConfig): Promise<AiResponse>;
    getFinalSummary(leadData: Partial<LeadData>, config: ChatConfig): Promise<string>;
    getFallbackResponse(lastUserMessage: string, currentData: Partial<LeadData>, keyToCollect: LeadDataKey | null, config: ChatConfig): AiResponse;
    getFallbackSummary(leadData: Partial<LeadData>): string;
    sendLeadToCRM(leadData: Partial<LeadData>, history: Message[], config: ChatConfig): Promise<void>;
}

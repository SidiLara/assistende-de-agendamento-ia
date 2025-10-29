import { Message } from "../modelos/Mensagem";
import { LeadData, LeadDataKey } from "../modelos/Lead";
import { ChatConfig } from "../modelos/ConfiguracaoChat";
import { AiResponse } from "../modelos/ChatResponse";

export interface ChatService {
    getAiResponse(history: Message[], currentData: Partial<LeadData>, config: ChatConfig): Promise<AiResponse>;
    getFinalSummary(leadData: Partial<LeadData>, config: ChatConfig): Promise<string>;
    getFallbackResponse(lastUserMessage: string, currentData: Partial<LeadData>, keyToCollect: LeadDataKey | null, config: ChatConfig): AiResponse;
    getFallbackSummary(leadData: Partial<LeadData>): string;
    sendLeadToCRM(leadData: Partial<LeadData>, history: Message[], config: ChatConfig): Promise<void>;
}

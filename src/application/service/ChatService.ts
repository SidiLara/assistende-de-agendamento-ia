import { Message } from "../../model/mensagem/MensagemModel";
import { LeadData, LeadDataKey } from "../../model/lead/LeadModel";
import { ChatConfig } from "../../model/configuracao/ConfiguracaoChatModel";
import { AiResponse } from "../../dto/response/chat/ChatResponse";

export interface ChatService {
    getAiResponse(history: Message[], currentData: Partial<LeadData>, config: ChatConfig): Promise<AiResponse>;
    getFinalSummary(leadData: Partial<LeadData>, config: ChatConfig): Promise<string>;
    getFallbackResponse(lastUserMessage: string, currentData: Partial<LeadData>, keyToCollect: LeadDataKey | null, config: ChatConfig): AiResponse;
    getFallbackSummary(leadData: Partial<LeadData>): string;
    sendLeadToCRM(leadData: Partial<LeadData>, history: Message[], config: ChatConfig): Promise<void>;
}

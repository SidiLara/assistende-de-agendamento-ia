import { Mensagem } from "./models/MensagemModel";
import { Lead, LeadKey } from "./models/LeadModel";
import { ConfiguracaoChat } from "./models/ConfiguracaoChatModel";
import { RespostaAi } from "./models/AiResponse";
import { SendCrmOptions } from "./InterfacesChat";
import { ManipuladorConfirmacao, ManipuladorCorrecao, ManipuladorSelecaoDataHora, ManipuladorResumo, ManipuladorMensagemUsuario } from "./handlers";

export interface ChatService {
    getAiResponse(history: Mensagem[], currentData: Partial<Lead>, config: ConfiguracaoChat): Promise<RespostaAi>;
    getFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string>;
    getFallbackResponse(lastUserMessage: string, currentData: Partial<Lead>, keyToCollect: LeadKey | null, config: ConfiguracaoChat): RespostaAi;
    getFallbackSummary(leadData: Partial<Lead>): string;
    sendLeadToCRM(leadData: Partial<Lead>, history: Mensagem[], config: ConfiguracaoChat, options: SendCrmOptions): Promise<void>;
}
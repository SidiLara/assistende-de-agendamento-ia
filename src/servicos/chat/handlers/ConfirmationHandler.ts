import { RemetenteMensagem } from '../modelos/MensagemModel';
import { ServicoChat } from '../ChatService';
import { AcaoHandler, FlowResult } from './AcaoHandler';
import { ConfirmationHandlerParams } from '../ChatInterfaces';
import { ConfiguracaoChat } from '../modelos/ConfiguracaoChatModel';

export class ConfirmationHandler implements AcaoHandler<ConfirmationHandlerParams> {
    private chatService: ServicoChat;
    private config: ConfiguracaoChat;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.chatService = chatService;
        this.config = config;
    }

    public async handle(params: ConfirmationHandlerParams): Promise<FlowResult> {
        const { leadData, currentHistory, isFallbackMode, triggeredObjections } = params;
        try {
            if ((window as any).fbq) {
                (window as any).fbq('track', 'Schedule');
            }
            await this.chatService.sendLeadToCRM(leadData, currentHistory, this.config, { isFallback: isFallbackMode, objections: triggeredObjections });
            return {
                newMessages: [{ id: Date.now(), sender: RemetenteMensagem.Bot, text: "Tudo certo! Seu agendamento foi confirmado. Em breve, um de nossos consultores entrará em contato com você. Obrigado!" }],
                newIsDone: true
            };
        } catch (error) {
            console.error("Falha ao enviar lead para o CRM:", error);
            return {
                newMessages: [{
                    id: Date.now(),
                    sender: RemetenteMensagem.Bot,
                    text: "Opa, tivemos um problema ao confirmar seu agendamento. Nossa equipe já foi notificada. Por favor, aguarde que entraremos em contato."
                }]
            };
        }
    }
}

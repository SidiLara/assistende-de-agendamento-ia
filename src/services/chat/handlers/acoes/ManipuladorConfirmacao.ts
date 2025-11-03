import { Remetente, Mensagem } from '../../modelos/MensagemModel';
import { ServicoChat } from '../../ServicoChat';
import { ManipuladorAcao, ResultadoFluxo } from '../ManipuladorAcao';
import { PillSelectionHandlerParams } from '../../InterfacesChat';
import { ConfiguracaoChat } from '../../modelos/ConfiguracaoChatModel';

export class ManipuladorConfirmacao implements ManipuladorAcao<PillSelectionHandlerParams> {
    private chatService: ServicoChat;
    private config: ConfiguracaoChat;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.chatService = chatService;
        this.config = config;
    }

    public async handle(params: PillSelectionHandlerParams): Promise<ResultadoFluxo> {
        const { leadData, currentHistory, isFallbackMode } = params;
        try {
            if ((window as any).fbq) {
                (window as any).fbq('track', 'Schedule');
            }
            await this.chatService.sendLeadToCRM(leadData, currentHistory, this.config, { isFallback: isFallbackMode, objections: [] });
            
            const successMessage: Mensagem = {
                id: (Date.now() + Math.random()).toString(),
                remetente: 'assistente',
                texto: "Tudo certo! Seu agendamento foi confirmado. Em breve, um de nossos consultores entrará em contato com você. Obrigado!",
                timestamp: Date.now()
            };

            return {
                newMessages: [successMessage],
                newIsDone: true
            };
        } catch (error) {
            console.error("Falha ao enviar lead para o CRM:", error);
            const errorMessage: Mensagem = {
                id: (Date.now() + Math.random()).toString(),
                remetente: 'assistente',
                texto: "Opa, tivemos um problema ao confirmar seu agendamento. Nossa equipe já foi notificada. Por favor, aguarde que entraremos em contato.",
                timestamp: Date.now()
            };
            return {
                newMessages: [errorMessage]
            };
        }
    }
}

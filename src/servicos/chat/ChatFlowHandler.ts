import { RemetenteMensagem } from './modelos/MensagemModel';
import { ServicoChat } from './ChatService';
import { ConfiguracaoChat } from './modelos/ConfiguracaoChatModel';
import { IChatFlowHandler, MessageHandlerParams, PillSelectionHandlerParams } from './ChatInterfaces';
// FIX: Changed import from non-existent AcaoHandler to ManipuladorAcao and aliased type.
import { ResultadoFluxo } from './handlers/ManipuladorAcao';
// FIX: Use correct class names exported from the handlers barrel file.
import { ManipuladorMensagemUsuario, ManipuladorConfirmacao, ManipuladorCorrecao, ManipuladorSelecaoDataHora } from './handlers';

export class ChatFlowHandler implements IChatFlowHandler {
    private userMessageHandler: ManipuladorMensagemUsuario;
    private confirmationHandler: ManipuladorConfirmacao;
    private correctionHandler: ManipuladorCorrecao;
    private dateTimeSelectionHandler: ManipuladorSelecaoDataHora;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.userMessageHandler = new ManipuladorMensagemUsuario(chatService, config);
        this.confirmationHandler = new ManipuladorConfirmacao(chatService, config);
        this.correctionHandler = new ManipuladorCorrecao();
        this.dateTimeSelectionHandler = new ManipuladorSelecaoDataHora(chatService, config);
    }

    public async processUserMessage(params: MessageHandlerParams): Promise<ResultadoFluxo> {
        return this.userMessageHandler.handle(params);
    }

    public async processPillSelection(params: PillSelectionHandlerParams): Promise<ResultadoFluxo> {
        const { value, isCorrecting, leadData } = params;

        if (value === 'confirm') {
            return this.confirmationHandler.handle(params);
        }

        if (value === 'correct' || isCorrecting) {
            return this.correctionHandler.handle(params);
        }
        
        // Se não for confirmação ou correção, é seleção de data/hora
        const isDateTimeSelection = (leadData.startDatetime && !leadData.startDatetime.includes('às')) || params.currentHistory.some(m => m.text.includes("dia da semana"));
        if(isDateTimeSelection) {
            return this.dateTimeSelectionHandler.handle(params);
        }

        // Fallback para uma mensagem de erro genérica se nenhuma condição for atendida
        console.error("Ação de pill não reconhecida:", value);
        return {
            newMessages: [{
                id: Date.now(),
                sender: RemetenteMensagem.Bot,
                text: "Desculpe, não entendi sua seleção. Poderia tentar novamente?"
            }]
        };
    }
}
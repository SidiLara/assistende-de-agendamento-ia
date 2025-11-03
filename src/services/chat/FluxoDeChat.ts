import { ResultadoFluxo, ManipuladorConfirmacao, ManipuladorCorrecao, ManipuladorSelecaoDataHora, ManipuladorMensagemUsuario } from './handlers';
import { ChatFlowManager, PillSelectionHandlerParams, UserMessageHandlerParams } from './InterfacesChat';
import { ServicoChat } from './ServicoChat';
import { ConfiguracaoChat } from './modelos/ConfiguracaoChatModel';

export class FluxoDeChat implements ChatFlowManager {
    private confirmHandler: ManipuladorConfirmacao;
    private correctionHandler: ManipuladorCorrecao;
    private dateTimeSelectionHandler: ManipuladorSelecaoDataHora;
    private userMessageHandler: ManipuladorMensagemUsuario;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.confirmHandler = new ManipuladorConfirmacao(chatService, config);
        this.correctionHandler = new ManipuladorCorrecao();
        this.dateTimeSelectionHandler = new ManipuladorSelecaoDataHora(chatService, config);
        this.userMessageHandler = new ManipuladorMensagemUsuario(chatService, config);
    }

    public processUserMessage(params: UserMessageHandlerParams): Promise<ResultadoFluxo> {
        return this.userMessageHandler.handle(params);
    }

    public processPillSelection(params: PillSelectionHandlerParams): Promise<ResultadoFluxo> {
        switch (params.value) {
            case 'confirm':
                return this.confirmHandler.handle(params);
            case 'correct':
                return this.correctionHandler.handle(params);
            default:
                return this.dateTimeSelectionHandler.handle(params);
        }
    }
}
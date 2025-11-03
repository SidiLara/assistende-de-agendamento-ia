import { Remetente, Mensagem } from './modelos/MensagemModel';
import { ServicoChat } from './ServicoChat';
import { ConfiguracaoChat } from './modelos/ConfiguracaoChatModel';
import { ChatFlowManager, MessageHandlerParams, PillSelectionHandlerParams } from './InterfacesChat';
import { ResultadoFluxo } from './handlers/ManipuladorAcao';
import { ManipuladorMensagemUsuario, ManipuladorConfirmacao, ManipuladorCorrecao, ManipuladorSelecaoDataHora } from './handlers';

export class ManipuladorFluxoChat implements ChatFlowManager {
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
        
        const isDateTimeSelection = (leadData.startDatetime && !leadData.startDatetime.includes('às')) || params.currentHistory.some(m => m.texto.includes("dia da semana"));
        if(isDateTimeSelection) {
            return this.dateTimeSelectionHandler.handle(params);
        }

        console.error("Ação de pill não reconhecida:", value);
        const errorMessage: Mensagem = {
            id: (Date.now() + Math.random()).toString(),
            remetente: 'assistente',
            texto: "Desculpe, não entendi sua seleção. Poderia tentar novamente?",
            timestamp: Date.now()
        };
        return {
            newMessages: [errorMessage]
        };
    }
}
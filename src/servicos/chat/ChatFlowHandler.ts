import { RemetenteMensagem } from './modelos/MensagemModel';
import { ServicoChat } from './ChatService';
import { ConfiguracaoChat } from './modelos/ConfiguracaoChatModel';
import { IChatFlowHandler, MessageHandlerParams, PillSelectionHandlerParams } from './ChatInterfaces';
import { FlowResult } from './handlers/AcaoHandler';
import { UserMessageHandler, ConfirmationHandler, CorrectionHandler, DateTimeSelectionHandler } from './handlers';

export class ChatFlowHandler implements IChatFlowHandler {
    private userMessageHandler: UserMessageHandler;
    private confirmationHandler: ConfirmationHandler;
    private correctionHandler: CorrectionHandler;
    private dateTimeSelectionHandler: DateTimeSelectionHandler;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.userMessageHandler = new UserMessageHandler(chatService, config);
        this.confirmationHandler = new ConfirmationHandler(chatService, config);
        this.correctionHandler = new CorrectionHandler();
        this.dateTimeSelectionHandler = new DateTimeSelectionHandler(chatService, config);
    }

    public async processUserMessage(params: MessageHandlerParams): Promise<FlowResult> {
        return this.userMessageHandler.handle(params);
    }

    public async processPillSelection(params: PillSelectionHandlerParams): Promise<FlowResult> {
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
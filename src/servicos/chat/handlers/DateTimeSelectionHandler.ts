import { RemetenteMensagem } from '../modelos/MensagemModel';
import { ServicoChat } from '../ChatService';
import { AcaoHandler, FlowResult } from './AcaoHandler';
import { DateTimeSelectionHandlerParams } from '../ChatInterfaces';
import { ConfiguracaoChat } from '../modelos/ConfiguracaoChatModel';
import { SummaryHandler } from './SummaryHandler';

export class DateTimeSelectionHandler implements AcaoHandler<DateTimeSelectionHandlerParams> {
    private chatService: ServicoChat;
    private config: ConfiguracaoChat;
    private summaryHandler: SummaryHandler;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.chatService = chatService;
        this.config = config;
        this.summaryHandler = new SummaryHandler(chatService, config);
    }

    public async handle(params: DateTimeSelectionHandlerParams): Promise<FlowResult> {
        const { value, leadData, isFallbackMode } = params;

        // Se o datetime já tem o dia mas não a hora, estamos recebendo a hora.
        if (leadData.startDatetime && !leadData.startDatetime.includes('às')) {
            const finalDateTime = `${leadData.startDatetime} às ${value}`;
            const finalData = { ...leadData, startDatetime: finalDateTime };
            // Após definir a data/hora completa, mostra o resumo.
            return this.summaryHandler.handle({ leadData: finalData, isFallbackMode });
        }
        
        // Se não, estamos recebendo o dia da semana.
        const updatedData = { ...leadData, startDatetime: value };
        const response = this.chatService.getFallbackResponse(value, updatedData, 'startDatetime', this.config);
        
        return {
            updatedLeadData: response.updatedLeadData,
            newMessages: response.responseText ? [{ id: Date.now() + 1, sender: RemetenteMensagem.Bot, text: response.responseText }] : [],
            newActionOptions: response.options || [],
            newIsActionPending: !!response.options,
            newNextKey: response.nextKey
        };
    }
}

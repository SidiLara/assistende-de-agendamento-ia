import { RemetenteMensagem } from '../../modelos/MensagemModel';
import { ServicoChat } from '../../ServicoChat';
import { ManipuladorAcao, ResultadoFluxo } from '../ManipuladorAcao';
import { DateTimeSelectionHandlerParams } from '../../InterfacesChat';
import { ConfiguracaoChat } from '../../modelos/ConfiguracaoChatModel';
import { ManipuladorResumo } from '../ManipuladorResumo';

export class ManipuladorSelecaoDataHora implements ManipuladorAcao<DateTimeSelectionHandlerParams> {
    private chatService: ServicoChat;
    private config: ConfiguracaoChat;
    private summaryHandler: ManipuladorResumo;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.chatService = chatService;
        this.config = config;
        this.summaryHandler = new ManipuladorResumo(chatService, config);
    }

    public async handle(params: DateTimeSelectionHandlerParams): Promise<ResultadoFluxo> {
        const { value, leadData, isFallbackMode } = params;

        if (leadData.startDatetime && !leadData.startDatetime.includes('às')) {
            const finalDateTime = `${leadData.startDatetime} às ${value}`;
            const finalData = { ...leadData, startDatetime: finalDateTime };
            return this.summaryHandler.handle({ leadData: finalData, isFallbackMode });
        }
        
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
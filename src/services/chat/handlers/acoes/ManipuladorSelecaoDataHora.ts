import { Remetente, Mensagem } from '../../modelos/MensagemModel';
import { ServicoChat } from '../../ServicoChat';
import { ManipuladorAcao, ResultadoFluxo } from '../ManipuladorAcao';
import { PillSelectionHandlerParams } from '../../InterfacesChat';
import { ConfiguracaoChat } from '../../modelos/ConfiguracaoChatModel';
import { ManipuladorResumo } from '../ManipuladorResumo';

export class ManipuladorSelecaoDataHora implements ManipuladorAcao<PillSelectionHandlerParams> {
    private chatService: ServicoChat;
    private config: ConfiguracaoChat;
    private summaryHandler: ManipuladorResumo;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.chatService = chatService;
        this.config = config;
        this.summaryHandler = new ManipuladorResumo(chatService, config);
    }

    public async handle(params: PillSelectionHandlerParams): Promise<ResultadoFluxo> {
        const { value, leadData, isFallbackMode } = params;

        if (leadData.startDatetime && !leadData.startDatetime.includes('às')) {
            const finalDateTime = `${leadData.startDatetime} às ${value}`;
            const finalData = { ...leadData, startDatetime: finalDateTime };
            return this.summaryHandler.handle({ leadData: finalData, isFallbackMode });
        }
        
        const updatedData = { ...leadData, startDatetime: value };
        const response = this.chatService.getFallbackResponse(value, updatedData, 'startDatetime', this.config);
        
        const newMessage: Mensagem | undefined = response.responseText ? {
            id: (Date.now() + Math.random()).toString(),
            remetente: 'assistente',
            texto: response.responseText,
            timestamp: Date.now(),
            options: response.action === 'SHOW_DAY_OPTIONS' ? response.options : [],
            isAction: !!response.action
        } : undefined;

        return {
            updatedLeadData: response.updatedLeadData,
            newMessages: newMessage ? [newMessage] : [],
            newActionOptions: response.options || [],
            newIsActionPending: !!response.options,
            newNextKey: response.nextKey
        };
    }
}

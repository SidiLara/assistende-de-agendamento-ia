import { RemetenteMensagem } from '../../modelos/MensagemModel';
// FIX: Corrected import to use the refactored ServicoChat interface file.
import { ServicoChat } from '../../ServicoChat';
// FIX: Changed import from non-existent AcaoHandler to ManipuladorAcao
import { ManipuladorAcao, ResultadoFluxo } from '../ManipuladorAcao';
// FIX: Corrected import to use the refactored InterfacesChat file.
import { DateTimeSelectionHandlerParams } from '../../InterfacesChat';
import { ConfiguracaoChat } from '../../modelos/ConfiguracaoChatModel';
// FIX: Corrected import to use the refactored ManipuladorResumo handler.
import { ManipuladorResumo } from '../ManipuladorResumo';

export class ManipuladorSelecaoDataHora implements ManipuladorAcao<DateTimeSelectionHandlerParams> {
    private chatService: ServicoChat;
    private config: ConfiguracaoChat;
    // FIX: Updated type to use the refactored ManipuladorResumo handler.
    private summaryHandler: ManipuladorResumo;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.chatService = chatService;
        this.config = config;
        // FIX: Instantiated the refactored ManipuladorResumo handler.
        this.summaryHandler = new ManipuladorResumo(chatService, config);
    }

    public async handle(params: DateTimeSelectionHandlerParams): Promise<ResultadoFluxo> {
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

import { RemetenteMensagem } from '../modelos/MensagemModel';
import { ServicoChat } from '../ServicoChat';
import { ManipuladorAcao, ResultadoFluxo } from './ManipuladorAcao';
import { ConfiguracaoChat } from '../modelos/ConfiguracaoChatModel';
// FIX: Correct casing for 'dateAndTime.ts' import.
import { calculateFullDate } from '../../../utils/formatters/dateAndTime';
import { Lead } from '../modelos/LeadModel';

interface SummaryHandlerParams {
    leadData: Partial<Lead>;
    isFallbackMode: boolean;
}

export class ManipuladorResumo implements ManipuladorAcao<SummaryHandlerParams> {
    private chatService: ServicoChat;
    private config: ConfiguracaoChat;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.chatService = chatService;
        this.config = config;
    }

    public async handle(params: SummaryHandlerParams): Promise<ResultadoFluxo> {
        const { leadData, isFallbackMode } = params;

        const dateTimeString = leadData.startDatetime || '';
        const dayMatch = dateTimeString.match(/(\b(domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado)\b)/i);
        const timeMatch = dateTimeString.match(/(\d{1,2}[:h]?\d{0,2})/);
        const dayOfWeek = dayMatch ? dayMatch[1] : '';
        const time = timeMatch ? timeMatch[0] : '';
        const finalDate = calculateFullDate(dayOfWeek, time);
        
        const finalLeadData = { ...leadData, startDatetime: finalDate };
        
        const summaryText = isFallbackMode
            ? this.chatService.getFallbackSummary(finalLeadData)
            : await this.chatService.getFinalSummary(finalLeadData, this.config);
            
        const finalDataWithSummary = { ...finalLeadData, finalSummary: summaryText };

        return {
            updatedLeadData: finalDataWithSummary,
            newMessages: [{ id: Date.now() + 2, sender: RemetenteMensagem.Bot, text: summaryText }],
            newActionOptions: [
                { label: 'Confirmar Agendamento', value: 'confirm' },
                { label: 'Corrigir Informações', value: 'correct' },
            ],
            newIsActionPending: true
        };
    }
}
import { Remetente, Mensagem } from '../modelos/MensagemModel';
import { ServicoChat } from '../ServicoChat';
import { ManipuladorAcao, ResultadoFluxo } from './ManipuladorAcao';
import { ConfiguracaoChat } from '../modelos/ConfiguracaoChatModel';
import { calcularDataCompleta } from '../../../utils/formatters/DateAndTime';
import { Lead } from '../modelos/LeadModel';
import { ResumoHandlerParams } from '../InterfacesChat';

export class ManipuladorResumo implements ManipuladorAcao<ResumoHandlerParams> {
    private chatService: ServicoChat;
    private config: ConfiguracaoChat;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.chatService = chatService;
        this.config = config;
    }

    public async handle(params: ResumoHandlerParams): Promise<ResultadoFluxo> {
        const { leadData, isFallbackMode } = params;

        const dateTimeString = leadData.startDatetime || '';
        const dayMatch = dateTimeString.match(/(\b(domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado)\b)/i);
        const timeMatch = dateTimeString.match(/(\d{1,2}[:h]?\d{0,2})/);
        const dayOfWeek = dayMatch ? dayMatch[1] : '';
        const time = timeMatch ? timeMatch[0] : '';
        const finalDate = calcularDataCompleta(dayOfWeek, time);
        
        const finalLeadData = { ...leadData, startDatetime: finalDate };
        
        const summaryText = isFallbackMode
            ? this.chatService.getFallbackSummary(finalLeadData)
            : await this.chatService.getFinalSummary(finalLeadData, this.config);
            
        const finalDataWithSummary = { ...finalLeadData, finalSummary: summaryText };

        const summaryMessage: Mensagem = {
            id: (Date.now() + Math.random()).toString(),
            remetente: 'assistente',
            texto: summaryText,
            timestamp: Date.now(),
        };

        return {
            updatedLeadData: finalDataWithSummary,
            newMessages: [summaryMessage],
            newActionOptions: [
                { label: 'Confirmar Agendamento', value: 'confirm' },
                { label: 'Corrigir Informações', value: 'correct' },
            ],
            newIsActionPending: true
        };
    }
}

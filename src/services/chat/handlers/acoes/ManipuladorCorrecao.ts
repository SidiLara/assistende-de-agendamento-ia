import { Remetente, Mensagem } from '../../modelos/MensagemModel';
import { Lead, LeadKey } from '../../modelos/LeadModel';
import { ManipuladorAcao, ResultadoFluxo } from '../ManipuladorAcao';
import { PillSelectionHandlerParams } from '../../InterfacesChat';

const CORRECTION_FIELD_LABELS: Record<string, string> = {
    clientName: 'Nome',
    topic: 'Objetivo',
    creditAmount: 'Valor do Crédito',
    monthlyInvestment: 'Reserva Mensal',
    clientWhatsapp: 'WhatsApp',
    clientEmail: 'E-mail',
    meetingType: 'Tipo de Reunião',
    startDatetime: 'Data/Hora'
};

export class ManipuladorCorrecao implements ManipuladorAcao<PillSelectionHandlerParams> {
    public async handle(params: PillSelectionHandlerParams): Promise<ResultadoFluxo> {
        const { value, leadData } = params;

        if (value === 'correct') {
            const correctionOptions = Object.entries(leadData)
                .filter(([key]) => CORRECTION_FIELD_LABELS[key])
                .map(([key, val]) => ({
                    label: `${CORRECTION_FIELD_LABELS[key]}: ${key === 'creditAmount' || key === 'monthlyInvestment' ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val as number) : val}`,
                    value: key
                }));
            const message: Mensagem = {
                id: (Date.now() + Math.random()).toString(),
                remetente: 'assistente',
                texto: "Sem problemas! O que você gostaria de corrigir?",
                timestamp: Date.now()
            };
            return {
                newIsCorrecting: true,
                newActionOptions: correctionOptions,
                newIsActionPending: true,
                newMessages: [message]
            };
        }

        const { [value as LeadKey]: _, ...rest } = leadData as Lead;

        if (value === 'startDatetime') {
            const message: Mensagem = {
                id: (Date.now() + Math.random()).toString(),
                remetente: 'assistente',
                texto: "Ok, vamos reagendar. Por favor, escolha o melhor <strong>dia da semana</strong> para a nossa conversa.",
                timestamp: Date.now()
            };
            return {
                updatedLeadData: rest,
                newIsCorrecting: false,
                newMessages: [message],
                newActionOptions: [
                    { label: 'Segunda-feira', value: 'Segunda-feira' },
                    { label: 'Terça-feira', value: 'Terça-feira' },
                    { label: 'Quarta-feira', value: 'Quarta-feira' },
                    { label: 'Quinta-feira', value: 'Quinta-feira' },
                    { label: 'Sexta-feira', value: 'Sexta-feira' },
                    { label: 'Sábado', value: 'Sábado' },
                    { label: 'Domingo', value: 'Domingo' },
                ],
                newIsActionPending: true,
                newNextKey: 'startDatetime'
            };
        } else {
            const message: Mensagem = {
                id: (Date.now() + Math.random()).toString(),
                remetente: 'assistente',
                texto: `Ok, vamos ajustar. Por favor, me informe o novo valor para: <strong>${CORRECTION_FIELD_LABELS[value]}</strong>.`,
                timestamp: Date.now()
            };
            return {
                updatedLeadData: rest,
                newIsCorrecting: false,
                newNextKey: value as LeadKey,
                newMessages: [message]
            };
        }
    }
}

import { RemetenteMensagem } from '../modelos/MensagemModel';
import { LeadKey } from '../modelos/LeadModel';
import { AcaoHandler, FlowResult } from './AcaoHandler';
import { CorrectionHandlerParams } from '../ChatInterfaces';

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

export class CorrectionHandler implements AcaoHandler<CorrectionHandlerParams> {
    public async handle(params: CorrectionHandlerParams): Promise<FlowResult> {
        const { value, leadData } = params;

        // Caso 1: O usuário clicou em "Corrigir Informações" pela primeira vez.
        if (value === 'correct') {
            const correctionOptions = Object.entries(leadData)
                .filter(([key]) => CORRECTION_FIELD_LABELS[key])
                .map(([key, value]) => ({
                    label: `${CORRECTION_FIELD_LABELS[key]}: ${key === 'creditAmount' || key === 'monthlyInvestment' ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number) : value}`,
                    value: key
                }));
            return {
                newIsCorrecting: true,
                newActionOptions: correctionOptions,
                newIsActionPending: true,
                newMessages: [{ id: Date.now(), sender: RemetenteMensagem.Bot, text: "Sem problemas! O que você gostaria de corrigir?" }]
            };
        }

        // Caso 2: O usuário selecionou o campo que deseja corrigir.
        const { [value as LeadKey]: _, ...rest } = leadData;
        if (value === 'startDatetime') {
            return {
                updatedLeadData: rest,
                newIsCorrecting: false,
                newMessages: [{ id: Date.now(), sender: RemetenteMensagem.Bot, text: "Ok, vamos reagendar. Por favor, escolha o melhor <strong>dia da semana</strong> para a nossa conversa." }],
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
            return {
                updatedLeadData: rest,
                newIsCorrecting: false,
                newNextKey: value as LeadKey,
                newMessages: [{ id: Date.now(), sender: RemetenteMensagem.Bot, text: `Ok, vamos ajustar. Por favor, me informe o novo valor para: <strong>${CORRECTION_FIELD_LABELS[value]}</strong>.` }]
            };
        }
    }
}

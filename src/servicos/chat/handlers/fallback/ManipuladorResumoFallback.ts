import { Lead } from '../../modelos/LeadModel';

export class ManipuladorResumoFallback {
    public generateSummary(leadData: Partial<Lead>): string {
        const formatCurrency = (value: number | undefined) => {
            if (value === undefined) return 'Não informado';
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        }

        let summary = "Perfeito! Por favor, confirme se os dados abaixo estão corretos:<br><br>";
        summary += `<strong>Nome:</strong> ${leadData.clientName || 'Não informado'}<br>`;
        summary += `<strong>Objetivo:</strong> ${leadData.topic || 'Não informado'}<br>`;
        summary += `<strong>Valor do Crédito:</strong> ${formatCurrency(leadData.creditAmount)}<br>`;
        summary += `<strong>Reserva Mensal:</strong> ${formatCurrency(leadData.monthlyInvestment)}<br>`;
        summary += `<strong>WhatsApp:</strong> ${leadData.clientWhatsapp || 'Não informado'}<br>`;
        summary += `<strong>E-mail:</strong> ${leadData.clientEmail || 'Não informado'}<br>`;
        summary += `<strong>Tipo de Reunião:</strong> ${leadData.meetingType || 'Não informado'}<br>`;
        summary += `<strong>Data/Hora:</strong> ${leadData.startDatetime || 'Não informado'}<br><br>`;
        summary += "Podemos confirmar o agendamento?";

        return summary;
    }
}

import { AiResponse } from "../../dto/response/chat/ChatResponse";
import { ChatConfig } from "../../model/configuracao/ConfiguracaoChatModel";
import { LeadData, LeadDataKey } from "../../model/lead/LeadModel";
import { FallbackRule } from "../../application/rule/FallbackRule";
import { parseHumanNumber } from "../../core/formatters/Number";

const fallbackFlow: LeadDataKey[] = [
    'clientName', 'topic', 'creditAmount', 'monthlyInvestment',
    'clientWhatsapp', 'clientEmail', 'meetingType', 'startDatetime'
];

const getFallbackQuestions = (config: ChatConfig): Record<LeadDataKey, string> => ({
    clientName: `Olá! Eu sou ${config.assistantName}, o assistente de planejamento do ${config.consultantName}. Que ótimo ter você aqui! Para começarmos, qual o seu <strong>nome completo</strong>, por favor?`,
    topic: "Obrigado, {clientName}! Qual o seu <strong>objetivo principal</strong> com este planejamento? (Ex: <strong>Carro</strong>, <strong>Imóvel</strong>, <strong>Viagem</strong>, <strong>Investir/Planejar</strong> ou outro projeto)",
    creditAmount: "Entendi. Para este projeto, qual o <strong>valor de crédito</strong> aproximado que você está buscando?",
    monthlyInvestment: "Ótimo! Para o seu planejamento, qual seria o valor da sua <strong>reserva mensal</strong> para essa aquisição?",
    clientWhatsapp: `Perfeito. Para que ${config.consultantName} possa entrar em contato, qual o seu melhor <strong>WhatsApp com DDD</strong>?`,
    clientEmail: "E qual o seu <strong>melhor e-mail</strong> para mantermos contato?",
    meetingType: "Estamos quase lá! Você prefere uma reunião por <strong>Videochamada</strong> ou <strong>Presencial</strong>?",
    startDatetime: "Qual o melhor <strong>dia da semana</strong> para a nossa conversa?",
    finalSummary: "",
    source: ""
});

export class FallbackRuleImpl implements FallbackRule {
    public getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<LeadData>,
        keyToCollect: LeadDataKey | null,
        config: ChatConfig
    ): AiResponse {
        let updatedLeadData = { ...currentData };

        if (keyToCollect && lastUserMessage) {
            if (keyToCollect === 'startDatetime' && currentData.startDatetime && !currentData.startDatetime.includes('às')) {
                updatedLeadData.startDatetime = `${currentData.startDatetime} às ${lastUserMessage}`;
            } else if (keyToCollect === 'creditAmount') {
                const numericValue = parseHumanNumber(lastUserMessage, true);
                if (!isNaN(numericValue)) updatedLeadData[keyToCollect] = numericValue;
            } else if (keyToCollect === 'monthlyInvestment') {
                const numericValue = parseHumanNumber(lastUserMessage, false);
                if (!isNaN(numericValue)) updatedLeadData[keyToCollect] = numericValue;
            } else {
                (updatedLeadData as Record<string, unknown>)[keyToCollect] = lastUserMessage;
            }
        }

        if (keyToCollect === 'startDatetime' && updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às')) {
            return {
                updatedLeadData,
                responseText: "Ótimo. E qual seria o <strong>melhor horário</strong> para você nesse dia?",
                action: null,
                nextKey: 'startDatetime'
            };
        }

        const nextKey = fallbackFlow.find(key => {
             if (key === 'startDatetime') {
                return !(updatedLeadData.startDatetime && updatedLeadData.startDatetime.includes('às'));
            }
            return !updatedLeadData.hasOwnProperty(key);
        }) || null;

        if (!nextKey) {
            return { updatedLeadData, responseText: "", action: null, nextKey: null };
        }

        const fallbackQuestions = getFallbackQuestions(config);
        let responseText = fallbackQuestions[nextKey];
        if (nextKey === 'topic' && updatedLeadData.clientName) {
            const firstName = updatedLeadData.clientName.split(' ')[0];
            responseText = responseText.replace('{clientName}', firstName);
        }

        let action = null;
        if (nextKey === 'startDatetime') {
            action = 'SHOW_DAY_OPTIONS';
        }

        return { updatedLeadData, responseText, action, nextKey };
    }

    public getFallbackSummary(leadData: Partial<LeadData>): string {
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

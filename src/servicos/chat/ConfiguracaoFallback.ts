import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { LeadKey } from "./modelos/LeadModel";

export const fallbackFlow: LeadKey[] = [
    'clientName', 'topic', 'creditAmount', 'monthlyInvestment',
    'clientWhatsapp', 'clientEmail', 'meetingType', 'startDatetime'
];

export const getFallbackQuestions = (config: ConfiguracaoChat): Record<LeadKey, string> => ({
    clientName: `Que ótimo ter você aqui! Para começarmos, qual o seu <strong>nome completo</strong>, por favor?`,
    topic: "Obrigado, {clientName}! Qual o seu <strong>objetivo principal</strong> com este planejamento? (Ex: <strong>Carro</strong>, <strong>Imóvel</strong>, <strong>Viagem</strong>, <strong>Investir/Planejar</strong> ou outro projeto)",
    creditAmount: "Entendi. Para este projeto, qual o <strong>valor de crédito</strong> aproximado que você está buscando?",
    monthlyInvestment: "Ótimo! E qual seria o valor da sua <strong>reserva mensal</strong>? Ou seja, o valor que você pode investir todo mês sem apertar seu orçamento.",
    clientWhatsapp: `Perfeito. Para que ${config.consultantName} possa entrar em contato, qual o seu melhor <strong>WhatsApp com DDD</strong>?`,
    clientEmail: "E qual o seu <strong>melhor e-mail</strong> para mantermos contato?",
    meetingType: "Estamos quase lá! Você prefere uma reunião por <strong>Videochamada</strong> ou <strong>Presencial</strong>?",
    startDatetime: "Qual o melhor <strong>dia da semana</strong> para a nossa conversa?",
    finalSummary: "",
    source: ""
});
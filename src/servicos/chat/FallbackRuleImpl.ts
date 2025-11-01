import { RespostaAi } from "./modelos/AiResponse";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { Lead, LeadKey } from "./modelos/LeadModel";
import { RegraFallback } from "./FallbackRule";
import { parseHumanNumber } from "../../utils/formatters/Number";
import { generateTimeSlots } from "../../utils/formatters/DateAndTime";

const extractName = (message: string): string => {
    const cleanedMessage = message.trim();
    const patterns = [
        /^meu nome é\s*(.+)/i,
        /^me chamo\s*(.+)/i,
        /^chamo-me\s*(.+)/i,
        /^sou o\s*(.+)/i,
        /^sou a\s*(.+)/i,
        /^é\s*(.+)/i,
        /^o meu é\s*(.+)/i,
    ];

    for (const pattern of patterns) {
        const match = cleanedMessage.match(pattern);
        if (match && match[1]) {
            const extractedName = match[1].trim();
            return extractedName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }
    }
    
    // If no pattern matches, assume the whole message is the name
    return cleanedMessage
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const fallbackFlow: LeadKey[] = [
    'clientName', 'topic', 'creditAmount', 'monthlyInvestment',
    'clientWhatsapp', 'clientEmail', 'meetingType', 'startDatetime'
];

const getFallbackQuestions = (config: ConfiguracaoChat): Record<LeadKey, string> => ({
    clientName: `Que ótimo ter você aqui! Para começarmos, qual o seu <strong>nome completo</strong>, por favor?`,
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

/**
 * Extrai múltiplos dados de uma única mensagem do usuário usando regex aprimorados.
 * @param message A mensagem do usuário.
 * @returns Um objeto com os novos dados extraídos.
 */
const extractAllData = (message: string): Partial<Lead> => {
    const extracted: Partial<Lead> = {};
    let remainingMessage = message;

    // Extrair Tópico
    const topicPatterns = {
        'Imóvel': /(imóvel|casa|apto|apartamento|terreno)/i,
        'Automóvel': /(carro|automóvel|veículo|moto)/i,
        'Viagem': /(viagem|viajar)/i,
        'Investimento': /(investimento|investir|planejar|planejamento|outro)/i
    };
    for (const [topic, pattern] of Object.entries(topicPatterns)) {
        if (pattern.test(remainingMessage)) {
            extracted.topic = topic as Lead['topic'];
            break;
        }
    }

    // Extrair Valor do Crédito (com maior flexibilidade)
    const creditMatch = remainingMessage.match(/(?:crédito|valor|preciso de|busco|de|na faixa de|em torno de)\s*(?:de\s+)?(?:R\$\s*)?([\d.,\s]+(?:mil|k)?)/i);
    if (creditMatch && creditMatch[1]) {
        const amount = parseHumanNumber(creditMatch[1], true);
        if (!isNaN(amount)) {
            extracted.creditAmount = amount;
            remainingMessage = remainingMessage.replace(creditMatch[0], '');
        }
    }

    // Extrair Investimento Mensal (com maior flexibilidade)
    const investmentMatch = remainingMessage.match(/(?:mensal|por mês|parcela|reserva|investir)\s*(?:de\s+)?(?:R\$\s*)?([\d.,\s]+(?:mil|k)?)/i);
    if (investmentMatch && investmentMatch[1]) {
        const amount = parseHumanNumber(investmentMatch[1], false);
        if (!isNaN(amount)) {
            extracted.monthlyInvestment = amount;
            remainingMessage = remainingMessage.replace(investmentMatch[0], '');
        }
    }

    // Extrair Email
    const emailMatch = remainingMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        extracted.clientEmail = emailMatch[0];
        remainingMessage = remainingMessage.replace(emailMatch[0], '');
    }
    
    // Extrair WhatsApp
    const whatsappMatch = remainingMessage.match(/\(?\s*(\d{2})\s*\)?\s*(9?\d{4})[-.\s]?(\d{4})/);
    if (whatsappMatch) {
        extracted.clientWhatsapp = `(${whatsappMatch[1]}) ${whatsappMatch[2]}${whatsappMatch[3]}`;
        remainingMessage = remainingMessage.replace(whatsappMatch[0], '');
    }

    // Extrair Tipo de Reunião
    if (/(video|online|chamada|virtual)/i.test(remainingMessage)) extracted.meetingType = 'Videochamada';
    else if (/(presencial|pessoalmente|escritório)/i.test(remainingMessage)) extracted.meetingType = 'Presencial';

    // Se ainda sobrar texto e não houver nome, assume que é o nome
    if (remainingMessage.trim().length > 2 && !extracted.clientName) {
        extracted.clientName = extractName(remainingMessage);
    }

    return extracted;
};

export class RegraFallbackImpl implements RegraFallback {
    public getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<Lead>,
        keyToCollect: LeadKey | null,
        config: ConfiguracaoChat
    ): RespostaAi {
        let updatedLeadData = { ...currentData };

        // 1. Tenta extrair qualquer dado da última mensagem do usuário de forma inteligente
        const extractedData = extractAllData(lastUserMessage);
        updatedLeadData = { ...updatedLeadData, ...extractedData };
        
        // 2. Processa a resposta direta para a pergunta anterior (keyToCollect), se não foi extraída na etapa 1
        if (keyToCollect && lastUserMessage) {
            if (keyToCollect === 'clientName' && !updatedLeadData.clientName) {
                updatedLeadData.clientName = extractName(lastUserMessage);
            } else if (keyToCollect === 'startDatetime' && updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às')) {
                if (lastUserMessage !== updatedLeadData.startDatetime) {
                    updatedLeadData.startDatetime = `${updatedLeadData.startDatetime} às ${lastUserMessage}`;
                }
            } else if (keyToCollect === 'creditAmount' && !updatedLeadData.creditAmount) {
                const numericValue = parseHumanNumber(lastUserMessage, true);
                if (!isNaN(numericValue)) updatedLeadData.creditAmount = numericValue;
            } else if (keyToCollect === 'monthlyInvestment' && !updatedLeadData.monthlyInvestment) {
                const numericValue = parseHumanNumber(lastUserMessage, false);
                if (!isNaN(numericValue)) updatedLeadData.monthlyInvestment = numericValue;
            } else if (!updatedLeadData[keyToCollect]) {
                (updatedLeadData as Record<string, unknown>)[keyToCollect] = lastUserMessage;
            }
        }

        // Lógica específica para agendamento (dia e depois hora)
        if (keyToCollect === 'startDatetime' && updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às')) {
             const timeSlots = generateTimeSlots();
             const timeOptions = timeSlots.map(time => ({ label: time, value: time }));

            return {
                updatedLeadData,
                responseText: "Ótimo. Agora, por favor, escolha um dos <strong>horários disponíveis</strong> abaixo:",
                action: null,
                nextKey: 'startDatetime',
                options: timeOptions
            };
        }

        // Encontra a próxima informação que falta no fluxo
        const nextKey = fallbackFlow.find(key => {
             if (key === 'startDatetime') {
                return !(updatedLeadData.startDatetime && updatedLeadData.startDatetime.includes('às'));
            }
            return !updatedLeadData.hasOwnProperty(key);
        }) || null;

        if (!nextKey) {
            return { updatedLeadData, responseText: "", action: null, nextKey: null };
        }

        // Monta a próxima pergunta
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

    public getFallbackSummary(leadData: Partial<Lead>): string {
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

import { RespostaAi } from "./modelos/AiResponse";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { Lead, LeadKey } from "./modelos/LeadModel";
import { RegraFallback } from "./FallbackRule";
import { parseHumanNumber } from "../../utils/formatters/Number";
import { generateTimeSlots } from "../../utils/formatters/DateAndTime";

const extractName = (message: string): string => {
    const cleanedMessage = message.trim();
    // Patterns to match introductory phrases. The (.+) will capture the name.
    const patterns = [
        /^meu nome é\s*(.+)/i,
        /^me chamo\s*(.+)/i,
        /^chamo-me\s*(.+)/i,
        /^sou o\s*(.+)/i,
        /^sou a\s*(.+)/i,
        /^é\s*(.+)/i,
        /^o meu é\s*(.+)/i,
    ];

    let extractedName = cleanedMessage; // Default to the whole message

    for (const pattern of patterns) {
        const match = cleanedMessage.match(pattern);
        if (match && match[1]) {
            extractedName = match[1].trim();
            break; // Found a match, no need to check other patterns
        }
    }
    
    // Capitalize each part of the name for better formatting.
    return extractedName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const fallbackFlow: LeadKey[] = [
    'clientName', 'topic', 'creditAmount', 'monthlyInvestment',
    'clientWhatsapp', 'clientEmail', 'meetingType', 'startDatetime'
];

const getFallbackQuestions = (config: ConfiguracaoChat): Record<LeadKey, string> => ({
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

/**
 * Extrai múltiplos dados de uma única mensagem do usuário usando regex.
 * @param message A mensagem do usuário.
 * @param currentData Os dados já coletados.
 * @returns Um objeto com os novos dados extraídos.
 */
const extractAllData = (message: string, currentData: Partial<Lead>): Partial<Lead> => {
    const extracted: Partial<Lead> = {};

    // Extrair Tópico
    if (!currentData.topic) {
        if (/(imóvel|casa|apto|apartamento|terreno)/i.test(message)) extracted.topic = 'Imóvel';
        else if (/(carro|automóvel|veículo|moto)/i.test(message)) extracted.topic = 'Automóvel';
        else if (/(viagem|viajar)/i.test(message)) extracted.topic = 'Viagem';
        else if (/(investimento|investir|planejar|planejamento)/i.test(message)) extracted.topic = 'Investimento';
    }

    // Extrair Valor do Crédito
    if (!currentData.creditAmount) {
        const creditMatch = message.match(/(?:crédito|valor|preciso|busco)\s*(?:de\s+)?(?:R\$\s*)?([\d.,\s]+(?:mil|k)?)/i);
        if (creditMatch && creditMatch[1]) {
            const amount = parseHumanNumber(creditMatch[1], true);
            if (!isNaN(amount)) extracted.creditAmount = amount;
        }
    }

    // Extrair Investimento Mensal
    if (!currentData.monthlyInvestment) {
        const investmentMatch = message.match(/(?:mensal|por mês|parcela|reserva)\s*(?:de\s+)?(?:R\$\s*)?([\d.,\s]+(?:mil|k)?)/i);
        if (investmentMatch && investmentMatch[1]) {
            const amount = parseHumanNumber(investmentMatch[1], false);
            if (!isNaN(amount)) extracted.monthlyInvestment = amount;
        }
    }

    // Extrair Email
    if (!currentData.clientEmail) {
        const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) extracted.clientEmail = emailMatch[0];
    }
    
    // Extrair WhatsApp
    if (!currentData.clientWhatsapp) {
        const whatsappMatch = message.match(/\(?\s*(\d{2})\s*\)?\s*(9?\d{4}[-.\s]?\d{4})/);
        if (whatsappMatch) {
            extracted.clientWhatsapp = `(${whatsappMatch[1]}) ${whatsappMatch[2]}`.replace(/[-.\s]/g, '');
        }
    }

    // Extrair Tipo de Reunião
    if (!currentData.meetingType) {
        if (/(video|online|chamada|virtual)/i.test(message)) extracted.meetingType = 'Videochamada';
        else if (/(presencial|pessoalmente|escritório)/i.test(message)) extracted.meetingType = 'Presencial';
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
        if (lastUserMessage) {
            const extractedData = extractAllData(lastUserMessage, updatedLeadData);
            updatedLeadData = { ...updatedLeadData, ...extractedData };
        }
        
        // 2. Processa a resposta direta para a pergunta anterior (keyToCollect)
        if (keyToCollect && lastUserMessage) {
            if (keyToCollect === 'clientName' && !updatedLeadData.clientName) {
                updatedLeadData.clientName = extractName(lastUserMessage);
            } else if (keyToCollect === 'startDatetime' && updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às')) {
                // Este bloco lida com a entrada de horário após um dia já ter sido fornecido.
                // Quando um botão de dia da semana é clicado, `lastUserMessage` é o dia, e `updatedLeadData.startDatetime`
                // também é o dia. Nesse caso, não devemos concatenar, mas prosseguir para pedir o horário na etapa 3.
                if (lastUserMessage !== updatedLeadData.startDatetime) {
                    updatedLeadData.startDatetime = `${updatedLeadData.startDatetime} às ${lastUserMessage}`;
                }
            } else if (keyToCollect === 'creditAmount' && !updatedLeadData.creditAmount) {
                const numericValue = parseHumanNumber(lastUserMessage, true);
                if (!isNaN(numericValue)) updatedLeadData[keyToCollect] = numericValue;
            } else if (keyToCollect === 'monthlyInvestment' && !updatedLeadData.monthlyInvestment) {
                const numericValue = parseHumanNumber(lastUserMessage, false);
                if (!isNaN(numericValue)) updatedLeadData[keyToCollect] = numericValue;
            } else if (!updatedLeadData[keyToCollect]) { // Apenas preenche se ainda não foi extraído
                (updatedLeadData as Record<string, unknown>)[keyToCollect] = lastUserMessage;
            }
        }

        // 3. Lógica específica para agendamento (dia e depois hora)
        if (keyToCollect === 'startDatetime' && updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às')) {
             const timeSlots = generateTimeSlots();
             const timeOptions = timeSlots.map(time => ({ label: time, value: time }));

            return {
                updatedLeadData,
                responseText: "Ótimo. Agora, por favor, escolha um dos <strong>horários disponíveis</strong> abaixo:",
                action: null, // A interface vai usar as 'options'
                nextKey: 'startDatetime',
                options: timeOptions
            };
        }

        // 4. Encontra a próxima informação que falta no fluxo
        const nextKey = fallbackFlow.find(key => {
             if (key === 'startDatetime') {
                return !(updatedLeadData.startDatetime && updatedLeadData.startDatetime.includes('às'));
            }
            return !updatedLeadData.hasOwnProperty(key);
        }) || null;

        // Se não falta mais nada, finaliza para mostrar o resumo
        if (!nextKey) {
            return { updatedLeadData, responseText: "", action: null, nextKey: null };
        }

        // 5. Monta a próxima pergunta
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
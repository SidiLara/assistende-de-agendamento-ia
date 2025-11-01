import { Lead } from '../../servicos/chat/modelos/LeadModel';
import { parseHumanNumber } from '../formatters/Number';

export const extractName = (message: string): string => {
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
            // Se encontrarmos um nome com um padrão explícito, retornamos imediatamente.
            return extractedName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }
    }
    
    // Se nenhum padrão explícito foi encontrado, então verificamos se é um cumprimento.
    const CUMPRIMENTOS = [
        'oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'opa',
        'gostaria', 'queria', 'preciso', 'ajuda', 'informações', 'informacoes',
        'saber mais', 'como funciona', 'sim', 'claro', 'tenho interesse', 'tudo bem',
        'iniciar', 'começar', 'vamos lá', 'ok'
    ];
    const lowerCaseMessage = cleanedMessage.toLowerCase();

    for (const cumprimento of CUMPRIMENTOS) {
        if (lowerCaseMessage.includes(cumprimento)) {
            return ''; // É um cumprimento, não um nome. Retorna string vazia.
        }
    }

    // Se não for um cumprimento conhecido e não for muito longo, assume-se que é um nome.
    const words = cleanedMessage.split(' ');
    if (words.length <= 4) {
        return cleanedMessage
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    return ''; // A mensagem é muito longa para ser apenas um nome e não é um cumprimento.
};

/**
 * Extrai múltiplos dados de uma única mensagem do usuário usando regex aprimorados.
 * @param message A mensagem do usuário.
 * @returns Um objeto com os novos dados extraídos.
 */
export const extractAllData = (message: string): Partial<Lead> => {
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
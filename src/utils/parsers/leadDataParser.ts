import { Lead } from '../../servicos/chat/modelos/LeadModel';
import { parseHumanNumber } from '../formatters/number';

/**
 * Tenta extrair um nome de uma frase de saudação.
 * @param text A string de entrada do usuário.
 * @returns O nome extraído ou nulo.
 */
export const extractName = (text: string): string | null => {
    const namePatterns = [
        /(?:meu nome é|me chamo|sou o|sou a|o meu é)\s+([a-zA-Z\sÀ-ú]+)/i,
        /^(?:eu sou o|eu sou a|eu sou|é)\s*([a-zA-Z\sÀ-ú]+)/i,
    ];

    for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const name = match[1].trim();
            // Evita capturar frases longas como nomes
            if (name.split(' ').length < 4) {
                return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            }
        }
    }
    
    // Se nenhum padrão específico for encontrado, assume que o texto inteiro pode ser o nome.
    if (text.split(' ').length <= 4 && /^[a-zA-Z\sÀ-ú]+$/.test(text.trim())) {
         return text.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    
    return null;
};

/**
 * Tenta extrair vários dados de lead de uma única string.
 * @param text A string de entrada do usuário.
 * @returns Um objeto parcial de Lead com os dados encontrados.
 */
export const extractAllData = (text: string): Partial<Lead> => {
    const data: Partial<Lead> = {};
    const lowerText = text.toLowerCase();

    // Extrai E-mail
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        data.clientEmail = emailMatch[0];
    }

    // Extrai WhatsApp
    const whatsappMatch = text.match(/(?:\(?\d{2}\)?\s?)?9?\d{4,5}-?\d{4}/);
    if (whatsappMatch) {
        data.clientWhatsapp = whatsappMatch[0];
    }
    
    // Extrai Valor de Crédito
    const creditAmountMatch = lowerText.match(/(?:crédito de|valor de|preciso de|em torno de|cerca de)\s*R?\$\s*([\d.,k\s]+mil?)/i);
    if (creditAmountMatch && creditAmountMatch[1]) {
        data.creditAmount = parseHumanNumber(creditAmountMatch[1], true);
    }
    
    // Extrai Investimento Mensal
    const monthlyInvestmentMatch = lowerText.match(/(?:investir|pagar|parcela de|reserva de|aportar)\s*R?\$\s*([\d.,k\s]+mil?)/i);
    if (monthlyInvestmentMatch && monthlyInvestmentMatch[1]) {
        data.monthlyInvestment = parseHumanNumber(monthlyInvestmentMatch[1], false);
    }

    return data;
};

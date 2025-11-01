/**
 * Valida se uma string parece ser um número de WhatsApp brasileiro válido.
 * Verifica se contém 10 ou 11 dígitos.
 * @param text A string para validar.
 * @returns `true` se for válido, `false` caso contrário.
 */
export const validateWhatsapp = (text: string): boolean => {
    const justDigits = text.replace(/\D/g, '');
    return justDigits.length >= 10 && justDigits.length <= 11;
};

/**
 * Valida se uma string tem o formato de um endereço de e-mail.
 * @param text A string para validar.
 * @returns `true` se for válido, `false` caso contrário.
 */
export const validateEmail = (text: string): boolean => {
    // Regex simples para validação de e-mail.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
};

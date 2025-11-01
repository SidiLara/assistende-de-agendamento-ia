export const validateWhatsapp = (text: string): boolean => {
    const justDigits = text.replace(/\D/g, '');
    return justDigits.length >= 10 && justDigits.length <= 11;
};

export const validateEmail = (text: string): boolean => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return emailRegex.test(text);
};

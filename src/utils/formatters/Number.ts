/**
 * Analisa uma string que representa um número em formato humano (ex: "100k", "1.500") e a converte para um número.
 * @param text A string a ser analisada.
 * @param isCredit Um booleano para indicar se o número é um valor de crédito, aplicando heurísticas específicas.
 * @returns O número analisado ou NaN se a análise falhar.
 */
export const parseHumanNumber = (text: string, isCredit: boolean): number => {
    // Remove "R$", espaços, pontos de milhar e substitui vírgula por ponto.
    const cleanedText = text.toLowerCase().replace(/r\$|\s|\./g, '').replace(',', '.');
    
    // Extrai o valor numérico, mantendo o ponto decimal.
    let number = parseFloat(cleanedText.replace(/[^\d.]/g, ''));

    if (isNaN(number)) {
        return NaN;
    }

    // Lida com abreviações como "k" ou "mil".
    if (cleanedText.includes('k') || cleanedText.includes('mil')) {
        number *= 1000;
    }
    
    // Heurística: se um usuário digita um número pequeno para crédito (ex: 100), é provável que seja 100.000.
    if (isCredit && number < 1000 && number > 10) {
        number *= 1000;
    }
    
    return number;
};

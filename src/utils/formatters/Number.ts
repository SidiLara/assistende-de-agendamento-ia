export const parseHumanNumber = (text: string, assumeThousandsForSmallNumbers = false): number => {
    let normalizedText = text.toLowerCase().trim().replace(/r\$|\./g, '').replace(',', '.');
    let multiplier = 1;
    if (normalizedText.includes('k') || normalizedText.includes('mil')) {
        multiplier = 1000;
        normalizedText = normalizedText.replace(/k|mil/g, '').trim();
    }
    const numericMatch = normalizedText.match(/[+-]?([0-9]*[.])?[0-9]+/);
    if (!numericMatch) return NaN;
    let value = parseFloat(numericMatch[0]);
    if (isNaN(value)) return NaN;
    value *= multiplier;
    if (assumeThousandsForSmallNumbers && multiplier === 1 && value >= 15 && value < 1000) {
        value *= 1000;
    }
    return value;
};
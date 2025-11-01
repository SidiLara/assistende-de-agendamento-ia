/**
 * Gera uma lista de horários disponíveis em intervalos de 30 minutos.
 * @returns Um array de strings com os horários formatados (ex: "09:00", "09:30").
 */
export const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const startTime = 9; // Início do horário comercial
    const endTime = 18;  // Fim do horário comercial

    for (let hour = startTime; hour < endTime; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
};

/**
 * Calcula a data completa com base em um dia da semana e hora, e a formata.
 * @param dayOfWeek O dia da semana (ex: "segunda-feira").
 * @param time A hora (ex: "14:00").
 * @returns A data e hora formatadas (ex: "segunda-feira (22/07) às 14:00").
 */
export const calculateFullDate = (dayOfWeek: string, time: string): string => {
    if (!dayOfWeek || !time) {
        return 'Data a combinar';
    }

    const dayMapping: { [key: string]: number } = {
        'domingo': 0,
        'segunda-feira': 1,
        'terça-feira': 2,
        'quarta-feira': 3,
        'quinta-feira': 4,
        'sexta-feira': 5,
        'sábado': 6
    };

    const targetDay = dayMapping[dayOfWeek.toLowerCase()];
    if (targetDay === undefined) {
        return `${dayOfWeek} às ${time}`; // Fallback se o dia não for reconhecido
    }

    const now = new Date();
    const currentDay = now.getDay();
    let daysToAdd = targetDay - currentDay;

    // Se o dia alvo for hoje mas o horário já passou, ou se o dia já passou nesta semana, agende para a próxima semana.
    const timeParts = time.match(/(\d+):(\d+)/);
    const targetHour = timeParts ? parseInt(timeParts[1], 10) : 0;
    if (daysToAdd < 0 || (daysToAdd === 0 && now.getHours() >= targetHour)) {
        daysToAdd += 7;
    }

    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysToAdd);

    const formattedDate = targetDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
    });

    return `${dayOfWeek} (${formattedDate}) às ${time}`;
};

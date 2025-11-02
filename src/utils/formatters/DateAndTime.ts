/**
 * Mapeia os dias da semana em português para o número do dia da semana (Domingo=0, Segunda=1, ...).
 */
const dayOfWeekMap: { [key: string]: number } = {
    'domingo': 0,
    'segunda-feira': 1,
    'terça-feira': 2,
    'quarta-feira': 3,
    'quinta-feira': 4,
    'sexta-feira': 5,
    'sábado': 6
};

/**
 * Calcula a data completa para o próximo dia da semana e hora especificados.
 * @param dayOfWeekString O dia da semana em português (ex: "segunda-feira").
 * @param timeString A hora no formato "HH:mm" ou "HH".
 * @returns A data e hora formatada (ex: "segunda-feira, 22 de julho de 2024, às 15:00").
 */
export const calculateFullDate = (dayOfWeekString: string, timeString: string): string => {
    const lowerDayOfWeek = dayOfWeekString.toLowerCase();
    if (!dayOfWeekMap.hasOwnProperty(lowerDayOfWeek)) {
        return dayOfWeekString; // Retorna o original se não for um dia válido
    }
    
    const targetDay = dayOfWeekMap[lowerDayOfWeek];
    const now = new Date();
    const currentDay = now.getDay();
    let daysUntilTarget = targetDay - currentDay;

    // Se o dia já passou nesta semana, ou é hoje mas a hora já passou, calcula para a próxima semana.
    if (daysUntilTarget < 0 || (daysUntilTarget === 0 && now.getHours() >= parseInt(timeString.split(':')[0] || '0', 10))) {
        daysUntilTarget += 7;
    }

    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysUntilTarget);

    // Formata a hora
    let [hours = '00', minutes = '00'] = timeString.replace('h', ':').split(':');
    hours = hours.padStart(2, '0');
    minutes = minutes.padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    targetDate.setHours(parseInt(hours, 10));
    targetDate.setMinutes(parseInt(minutes, 10));
    targetDate.setSeconds(0);
    targetDate.setMilliseconds(0);

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    };
    const formattedDate = new Intl.DateTimeFormat('pt-BR', options).format(targetDate);

    return `${formattedDate}, às ${formattedTime}`;
};

/**
 * Gera uma lista de horários disponíveis em intervalos de 30 minutos, das 09:00 às 18:00.
 * @returns Um array de strings com os horários (ex: ["09:00", "09:30", ...]).
 */
export const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const startTime = 9 * 60; // 9:00 em minutos
    const endTime = 18 * 60; // 18:00 em minutos
    const interval = 30; // 30 minutos

    for (let time = startTime; time <= endTime; time += interval) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    }
    
    return slots;
};

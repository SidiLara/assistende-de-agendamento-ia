export const calculateFullDate = (dayOfWeek: string, time: string): string => {
    const now = new Date();
    
    // More robust day matching
    const weekDayMap: { [key: string]: number } = {
        domingo: 0, segunda: 1, terca: 2, terça: 2, quarta: 3, 
        quinta: 4, sexta: 5, sabado: 6, sábado: 6
    };
    const normalizedDayInput = dayOfWeek.toLowerCase().replace('-feira', '');
    const targetDayKey = Object.keys(weekDayMap).find(key => normalizedDayInput.includes(key));
    const targetDay = targetDayKey !== undefined ? weekDayMap[targetDayKey] : -1;

    // More robust time parsing
    const timeInput = time.toLowerCase();
    const timeMatch = timeInput.match(/(\d{1,2})[:h]?(\d{2})?/);

    if (targetDay === -1 || !timeMatch) {
        return `${dayOfWeek} ${time}`.trim();
    }

    const hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;

    if (isNaN(hour) || isNaN(minute) || hour > 23 || minute > 59) {
         return `${dayOfWeek} ${time}`.trim();
    }

    const resultDate = new Date();
    resultDate.setHours(hour, minute, 0, 0);

    let dayDiff = targetDay - now.getDay();
    if (dayDiff < 0) {
        dayDiff += 7;
    } else if (dayDiff === 0 && resultDate.getTime() < now.getTime()) {
        dayDiff += 7;
    }
    
    resultDate.setDate(now.getDate() + dayDiff);

    return resultDate.toLocaleString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const generateTimeSlots = (): string[] => {
    const createRandomTime = (startHour: number, endHour: number): string => {
        const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
        const minute = Math.random() < 0.5 ? 0 : 30;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    const morning = createRandomTime(7, 12);
    const afternoon = createRandomTime(13, 18);
    const evening = createRandomTime(18, 22);

    const slots = Array.from(new Set([morning, afternoon, evening]));
    slots.sort();

    while (slots.length < 3) {
        const newSlot = createRandomTime(7, 22);
        if (!slots.includes(newSlot)) {
            slots.push(newSlot);
        }
        slots.sort();
    }
    
    return slots;
};

export const calculateFullDate = (dayOfWeek: string, time: string): string => {
    const now = new Date();
    
    const weekDayMap: { [key: string]: number } = {
        domingo: 0, segunda: 1, terca: 2, terça: 2, quarta: 3, 
        quinta: 4, sexta: 5, sabado: 6, sábado: 6
    };
    const normalizedDayInput = dayOfWeek.toLowerCase().replace('-feira', '');
    const targetDayKey = Object.keys(weekDayMap).find(key => normalizedDayInput.includes(key));
    const targetDay = targetDayKey !== undefined ? weekDayMap[targetDayKey] : -1;

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

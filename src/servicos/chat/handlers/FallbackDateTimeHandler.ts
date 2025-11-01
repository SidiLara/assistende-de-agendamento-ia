import { RespostaAi } from "../modelos/AiResponse";
import { Lead } from "../modelos/LeadModel";
import { generateTimeSlots } from "../../../utils/formatters/DateAndTime";

export class FallbackDateTimeHandler {
    public handle(
        updatedLeadData: Partial<Lead>
    ): RespostaAi | null {
        const isCollectingTime = updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às');
        
        if (isCollectingTime) {
             const timeSlots = generateTimeSlots();
             const timeOptions = timeSlots.map(time => ({ label: time, value: time }));

            return {
                updatedLeadData,
                responseText: "Ótimo. Agora, por favor, escolha um dos <strong>horários disponíveis</strong> abaixo:",
                action: null,
                nextKey: 'startDatetime',
                options: timeOptions
            };
        }
        return null;
    }
}

import { RespostaAi } from "../../modelos/RespostaAi";
import { Lead } from "../../modelos/LeadModel";
import { gerarHorarios } from "../../../../utils/formatters/DateAndTime";

export class ManipuladorDataHoraFallback {
    public handle(
        updatedLeadData: Partial<Lead>
    ): RespostaAi | null {
        const isCollectingTime = updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às');
        
        if (isCollectingTime) {
             const timeSlots = gerarHorarios();
             const timeOptions = timeSlots.map((time: string) => ({ label: time, value: time }));

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
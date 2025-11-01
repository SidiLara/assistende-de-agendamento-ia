import { RespostaAi } from "./modelos/RespostaAi";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { Lead, LeadKey } from "./modelos/LeadModel";
import { RegraFallback } from "./RegraFallback";
import { fallbackFlow, getFallbackQuestions } from "./ConfiguracaoFallback";
import { ManipuladorObjecaoFallback, ManipuladorDadosFallback, ManipuladorDataHoraFallback, ManipuladorResumoFallback } from './handlers';

export class RegraFallbackImpl implements RegraFallback {
    private objectionHandler: ManipuladorObjecaoFallback;
    private dataHandler: ManipuladorDadosFallback;
    private dateTimeHandler: ManipuladorDataHoraFallback;
    private summaryHandler: ManipuladorResumoFallback;

    constructor() {
        this.objectionHandler = new ManipuladorObjecaoFallback();
        this.dataHandler = new ManipuladorDadosFallback();
        this.dateTimeHandler = new ManipuladorDataHoraFallback();
        this.summaryHandler = new ManipuladorResumoFallback();
    }

    public getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<Lead>,
        keyToCollect: LeadKey | null,
        config: ConfiguracaoChat
    ): RespostaAi {
        const objectionResponse = this.objectionHandler.handle(lastUserMessage, currentData, keyToCollect, config);
        if (objectionResponse) {
            return objectionResponse;
        }

        const updatedLeadData = this.dataHandler.handle(lastUserMessage, currentData, keyToCollect);

        const dateTimeResponse = this.dateTimeHandler.handle(updatedLeadData);
        if (dateTimeResponse) {
            return dateTimeResponse;
        }

        const nextKey = fallbackFlow.find(key => {
             if (key === 'startDatetime') {
                return !(updatedLeadData.startDatetime && updatedLeadData.startDatetime.includes('às'));
            }
            return !updatedLeadData.hasOwnProperty(key);
        }) || null;

        if (!nextKey) {
            return { updatedLeadData, responseText: "", action: null, nextKey: null };
        }

        const fallbackQuestions = getFallbackQuestions(config);
        let responseText = fallbackQuestions[nextKey];
        
        if (nextKey === 'topic') {
            if (updatedLeadData.clientName) {
                const firstName = updatedLeadData.clientName.split(' ')[0];
                responseText = responseText.replace('{clientName}', firstName);
            } else {
                responseText = responseText.replace("Obrigado, {clientName}! ", "");
            }
        }

        const action = nextKey === 'startDatetime' ? 'SHOW_DAY_OPTIONS' : null;

        return { updatedLeadData, responseText, action, nextKey };
    }

    public getFallbackSummary(leadData: Partial<Lead>): string {
        return this.summaryHandler.generateSummary(leadData);
    }
}
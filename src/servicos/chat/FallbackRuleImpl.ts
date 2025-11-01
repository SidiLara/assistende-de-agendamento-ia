import { RespostaAi } from "./modelos/AiResponse";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { Lead, LeadKey } from "./modelos/LeadModel";
import { RegraFallback } from "./FallbackRule";
import { fallbackFlow, getFallbackQuestions } from "./FallbackConfig";
import { FallbackObjectionHandler, FallbackDataHandler, FallbackDateTimeHandler, FallbackSummaryHandler } from './handlers';

export class RegraFallbackImpl implements RegraFallback {
    private objectionHandler: FallbackObjectionHandler;
    private dataHandler: FallbackDataHandler;
    private dateTimeHandler: FallbackDateTimeHandler;
    private summaryHandler: FallbackSummaryHandler;

    constructor() {
        this.objectionHandler = new FallbackObjectionHandler();
        this.dataHandler = new FallbackDataHandler();
        this.dateTimeHandler = new FallbackDateTimeHandler();
        this.summaryHandler = new FallbackSummaryHandler();
    }

    public getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<Lead>,
        keyToCollect: LeadKey | null,
        config: ConfiguracaoChat
    ): RespostaAi {
        // 1. Tenta lidar com a mensagem como uma objeção
        const objectionResponse = this.objectionHandler.handle(lastUserMessage, currentData, keyToCollect, config);
        if (objectionResponse) {
            return objectionResponse;
        }

        // 2. Coleta os dados da mensagem do usuário
        const updatedLeadData = this.dataHandler.handle(lastUserMessage, currentData, keyToCollect);

        // 3. Tenta lidar com o fluxo de data/hora
        const dateTimeResponse = this.dateTimeHandler.handle(updatedLeadData);
        if (dateTimeResponse) {
            return dateTimeResponse;
        }

        // 4. Determina a próxima pergunta do fluxo principal
        const nextKey = fallbackFlow.find(key => {
             if (key === 'startDatetime') {
                return !(updatedLeadData.startDatetime && updatedLeadData.startDatetime.includes('às'));
            }
            return !updatedLeadData.hasOwnProperty(key);
        }) || null;

        // Se o fluxo terminou, retorna um objeto vazio para o SummaryHandler assumir
        if (!nextKey) {
            return { updatedLeadData, responseText: "", action: null, nextKey: null };
        }

        // 5. Monta a resposta final
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

import { RespostaAi } from "./modelos/RespostaAi";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { Lead, LeadKey } from "./modelos/LeadModel";
import { Mensagem } from "./modelos/MensagemModel";
import { SendCrmOptions } from "./InterfacesChat";
import { ServicoChat } from "./ServicoChat";
import { 
    ManipuladorDadosFallback,
    ManipuladorDataHoraFallback,
    ManipuladorObjecaoFallback,
    ManipuladorResumoFallback
} from "./handlers";

export class ServicoChatAlternativo implements ServicoChat {
    private dataHandler: ManipuladorDadosFallback;
    private timeHandler: ManipuladorDataHoraFallback;
    private objectionHandler: ManipuladorObjecaoFallback;
    private summaryHandler: ManipuladorResumoFallback;

    constructor() {
        this.dataHandler = new ManipuladorDadosFallback();
        this.timeHandler = new ManipuladorDataHoraFallback();
        this.objectionHandler = new ManipuladorObjecaoFallback();
        this.summaryHandler = new ManipuladorResumoFallback();
    }

    public getFallbackResponse(
        lastUserMessage: string, 
        currentData: Partial<Lead>, 
        keyToCollect: LeadKey | null, 
        config: ConfiguracaoChat
    ): RespostaAi {
        const objectionResult = this.objectionHandler.handle(lastUserMessage, currentData, keyToCollect, config);
        if (objectionResult) return objectionResult;

        const updatedLeadData = { ...currentData, [keyToCollect as LeadKey]: lastUserMessage };

        const dateResult = this.timeHandler.handle(updatedLeadData);
        if (dateResult) return dateResult;

        const dataResult = this.dataHandler.handle(lastUserMessage, updatedLeadData, keyToCollect, config);
        if (dataResult) return dataResult;

        return {
            updatedLeadData: {},
            responseText: "Não entendi. Poderia repetir?",
            action: null,
            nextKey: keyToCollect,
        };
    }

    public getFallbackSummary(leadData: Partial<Lead>): string {
        return this.summaryHandler.generateSummary(leadData);
    }

    public async getAiResponse(history: Mensagem[], currentData: Partial<Lead>, config: ConfiguracaoChat): Promise<RespostaAi> {
        throw new Error("AI response is not available in fallback mode.");
    }

    public async getFinalSummary(leadData: Partial<Lead>, config: ConfiguracaoChat): Promise<string> {
        throw new Error("AI summary is not available in fallback mode.");
    }

    public async sendLeadToCRM(leadData: Partial<Lead>, history: Mensagem[], config: ConfiguracaoChat, options: SendCrmOptions): Promise<void> {
        console.log("Fallback mode: Lead sent to CRM with data:", { leadData, history, config, options });
        return;
    }
}
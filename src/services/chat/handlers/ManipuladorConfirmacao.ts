import { ServicoChat } from '../ServicoChat';
import { PillConfirmationHandler, PillSelectionHandlerParams } from '../InterfacesChat';
import { ConfiguracaoChat } from '../modelos/ConfiguracaoChatModel';
import { RespostaAi } from '../modelos/RespostaAi';
import { ResultadoFluxo } from './ResultadoFluxo';

export class ManipuladorConfirmacao implements PillConfirmationHandler {
    constructor(
        private readonly chatService: ServicoChat,
        private readonly config: ConfiguracaoChat
    ) {}

    public async handle(params: PillSelectionHandlerParams): Promise<ResultadoFluxo> {
        const { aiResponse, userResponse, fullConversation } = params;
        const lead = this.config.lead;

        if (aiResponse.isFinal) {
            return this.handleFinalResponse(aiResponse, userResponse);
        }

        return this.handleIntermediateResponse(aiResponse, userResponse, fullConversation, lead?.name || '');
    }

    private handleFinalResponse(aiResponse: RespostaAi, userResponse: string): ResultadoFluxo {
        aiResponse.followUp = [];
        return new ResultadoFluxo(true, aiResponse, userResponse, true);
    }

    private async handleIntermediateResponse(
        aiResponse: RespostaAi, 
        userResponse: string, 
        fullConversation: string, 
        leadName: string
    ): Promise<ResultadoFluxo> {
        aiResponse.followUp = [];
        const nextQuestion = await this.chatService.getNextQuestion(
            this.config.language, 
            this.config.productName, 
            fullConversation, 
            leadName
        );
        return new ResultadoFluxo(true, nextQuestion, userResponse, false);
    }
}
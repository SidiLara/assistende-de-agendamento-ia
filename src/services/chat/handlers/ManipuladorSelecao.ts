import { ServicoChat } from '../ServicoChat';
import { PillSelectionHandler, PillSelectionHandlerParams } from '../InterfacesChat';
import { ConfiguracaoChat } from '../modelos/ConfiguracaoChatModel';
import { ResultadoFluxo } from './ResultadoFluxo';

export class ManipuladorSelecao implements PillSelectionHandler {
    constructor(
        private readonly chatService: ServicoChat,
        private readonly config: ConfiguracaoChat
    ) {}

    public async handle(params: PillSelectionHandlerParams): Promise<ResultadoFluxo> {
        const { userResponse, fullConversation, aiResponse } = params;
        const leadName = this.config.lead?.name || '';

        const nextQuestion = await this.chatService.getNextQuestion(
            this.config.language,
            this.config.productName,
            fullConversation,
            leadName
        );

        return new ResultadoFluxo(true, nextQuestion, userResponse, false);
    }
}
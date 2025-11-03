import { ServicoChat } from '../ServicoChat';
import { PillSwitchHandler, PillUpdateHandlerParams } from '../InterfacesChat';
import { ConfiguracaoChat } from '../modelos/ConfiguracaoChatModel';
import { ResultadoFluxo } from './ResultadoFluxo';

export class ManipuladorTroca implements PillSwitchHandler {
    constructor(
        private readonly chatService: ServicoChat,
        private readonly config: ConfiguracaoChat
    ) {}

    public async handle(params: PillUpdateHandlerParams): Promise<ResultadoFluxo> {
        const { lead, conversation, aiResponse } = params;
        const updatedLead = this.config.lead;
        if(updatedLead && updatedLead.name && updatedLead.phone && updatedLead.email) {
            updatedLead.name = lead.name ?? updatedLead.name;
            updatedLead.phone = lead.phone ?? updatedLead.phone;
            updatedLead.email = lead.email ?? updatedLead.email;
        }

        this.config.setLead(updatedLead ?? {name: lead.name, phone: lead.phone, email: lead.email});
        const fullConversation = conversation + "\nAI: " + aiResponse.text;

        const nextQuestion = await this.chatService.getNextQuestion(
            this.config.language,
            this.config.productName,
            fullConversation,
            lead.name || ''
        );

        return new ResultadoFluxo(true, nextQuestion, aiResponse.text, false);
    }
}

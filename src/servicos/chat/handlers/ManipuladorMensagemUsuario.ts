import { RemetenteMensagem } from '../modelos/MensagemModel';
import { ServicoChat } from '../ServicoChat';
// FIX: Corrected import casing to use PascalCase 'InputValidator.ts'.
import { validateEmail, validateWhatsapp } from '../../../utils/validators/InputValidator';
import { ManipuladorAcao, ResultadoFluxo } from './ManipuladorAcao';
import { UserMessageHandlerParams } from '../InterfacesChat';
import { ConfiguracaoChat } from '../modelos/ConfiguracaoChatModel';
import { ManipuladorResumo } from './ManipuladorResumo';

export class ManipuladorMensagemUsuario implements ManipuladorAcao<UserMessageHandlerParams> {
    private chatService: ServicoChat;
    private config: ConfiguracaoChat;
    private summaryHandler: ManipuladorResumo;

    constructor(chatService: ServicoChat, config: ConfiguracaoChat) {
        this.chatService = chatService;
        this.config = config;
        this.summaryHandler = new ManipuladorResumo(chatService, config);
    }

    public async handle(params: UserMessageHandlerParams): Promise<ResultadoFluxo> {
        const { text, leadData, nextKey, currentHistory, isFallbackMode, isErrorRecovery } = params;
        
        if (nextKey === 'clientWhatsapp' && !validateWhatsapp(text)) {
            return {
                newMessages: [{
                    id: Date.now() + 1,
                    sender: RemetenteMensagem.Bot,
                    text: "Hmm, não consegui identificar um número de WhatsApp válido. Por favor, insira o número com DDD no formato <strong>(XX) 9XXXX-XXXX</strong>."
                }]
            };
        }
        if (nextKey === 'clientEmail' && !validateEmail(text)) {
            return {
                newMessages: [{
                    id: Date.now() + 1,
                    sender: RemetenteMensagem.Bot,
                    text: "Parece que o e-mail informado não é válido. Por favor, verifique e tente novamente."
                }]
            };
        }
        
        let response;
        let finalResult: ResultadoFluxo = {};

        if (isErrorRecovery) {
             finalResult.newMessages = [{ 
                id: Date.now() + 1, 
                sender: RemetenteMensagem.Bot, 
                text: "Tivemos um problema de comunicação com a inteligência artificial. Para não te deixar esperando, vamos continuar de forma mais direta.",
                isNotice: true,
            }];
        }

        if (isFallbackMode || isErrorRecovery) {
            response = this.chatService.getFallbackResponse(text, leadData, nextKey, this.config);
        } else {
            response = await this.chatService.getAiResponse(currentHistory, leadData, this.config);
        }

        const newLeadData = { ...leadData, ...response.updatedLeadData };

        if (response.responseText) {
            const botMessage = { id: Date.now() + 2, sender: RemetenteMensagem.Bot, text: response.responseText };
            finalResult.newMessages = [...(finalResult.newMessages || []), botMessage];
        }

        if (response.action === 'SHOW_DAY_OPTIONS') {
            finalResult.newActionOptions = [
                { label: 'Segunda-feira', value: 'Segunda-feira' },
                { label: 'Terça-feira', value: 'Terça-feira' },
                { label: 'Quarta-feira', value: 'Quarta-feira' },
                { label: 'Quinta-feira', value: 'Quinta-feira' },
                { label: 'Sexta-feira', value: 'Sexta-feira' },
                { label: 'Sábado', value: 'Sábado' },
                { label: 'Domingo', value: 'Domingo' },
            ];
            finalResult.newIsActionPending = true;
        }

        finalResult.updatedLeadData = newLeadData;
        finalResult.newNextKey = response.nextKey;
        if (response.triggeredObjectionText) {
            finalResult.newTriggeredObjection = response.triggeredObjectionText;
        }

        if (response.nextKey === null) {
            const summaryResult = await this.summaryHandler.handle({ leadData: newLeadData, isFallbackMode });
            finalResult = {
                ...finalResult,
                ...summaryResult,
                updatedLeadData: summaryResult.updatedLeadData,
            };
        }
        
        return finalResult;
    }
}

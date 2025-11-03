import { Remetente, Mensagem } from '../modelos/MensagemModel';
import { ServicoChat } from '../ServicoChat';
import { validarEmail, validarWhatsapp } from '../../../utils/validators';
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
        this.summaryHandler = new ManipuladorResumo(this.chatService, this.config);
    }

    public async handle(params: UserMessageHandlerParams): Promise<ResultadoFluxo> {
        const { text, leadData, nextKey, currentHistory, isFallbackMode, isErrorRecovery } = params;
        
        if (nextKey === 'clientWhatsapp' && !validarWhatsapp(text)) {
            const errorMessage: Mensagem = {
                id: (Date.now() + Math.random()).toString(),
                remetente: 'assistente',
                texto: "Hmm, não consegui identificar um número de WhatsApp válido. Por favor, insira o número com DDD no formato <strong>(XX) 9XXXX-XXXX</strong>.",
                timestamp: Date.now(),
            };
            return { newMessages: [errorMessage] };
        }
        if (nextKey === 'clientEmail' && !validarEmail(text)) {
            const errorMessage: Mensagem = {
                id: (Date.now() + Math.random()).toString(),
                remetente: 'assistente',
                texto: "Parece que o e-mail informado não é válido. Por favor, verifique e tente novamente.",
                timestamp: Date.now(),
            };
            return { newMessages: [errorMessage] };
        }
        
        let response;
        let finalResult: ResultadoFluxo = {};

        if (isErrorRecovery) {
            const noticeMessage: Mensagem = {
                id: (Date.now() + Math.random()).toString(),
                remetente: 'assistente',
                texto: "Tivemos um problema de comunicação com a inteligência artificial. Para não te deixar esperando, vamos continuar de forma mais direta.",
                isNotice: true,
                timestamp: Date.now(),
            };
             finalResult.newMessages = [noticeMessage];
        }

        if (isFallbackMode || isErrorRecovery) {
            response = this.chatService.getFallbackResponse(text, leadData, nextKey, this.config);
        } else {
            response = await this.chatService.getAiResponse(currentHistory, leadData, this.config);
        }

        const newLeadData = { ...leadData, ...response.updatedLeadData };

        if (response.responseText) {
            const botMessage: Mensagem = {
                id: (Date.now() + Math.random()).toString(),
                remetente: 'assistente',
                texto: response.responseText,
                timestamp: Date.now(),
            };
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

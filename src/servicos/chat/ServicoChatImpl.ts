import { Mensagem } from './modelos/MensagemModel';
import { Lead } from './modelos/LeadModel';
import { ConfiguracaoChat } from './modelos/ConfiguracaoChatModel';
import { ChatPrompts } from './ChatPrompts';
import { ServicoDeChat, RegraDeFallback } from './InterfacesChat';
import { RespostaAi } from './modelos/RespostaAi';
import { ServicoDeApi, ServicoDeCrm } from '../api/ApiInterfaces';

export class ServicoChatImpl implements ServicoDeChat {
    constructor(
        private fallbackRule: RegraDeFallback,
        private apiService: ServicoDeApi,
        private crmService: ServicoDeCrm
    ) {}

    async analisarMensagem(config: ConfiguracaoChat, lead: Lead, historico: Mensagem[]): Promise<RespostaAi> {
        const prompt = ChatPrompts.construirPrompt(config, lead, historico);
        
        try {
            return await this.apiService.analisarConteudo(prompt);
        } catch (error) {
            console.error("Erro ao analisar mensagem. Tentando fallback:", error);
            const fallbackMessage = this.fallbackRule.aplicar(lead, config);
            if (fallbackMessage) {
                return {
                    tipo: 'pergunta',
                    texto: fallbackMessage,
                };
            }
            throw new Error("Falha na análise da mensagem e no mecanismo de fallback.");
        }
    }

    async enviarLead(lead: Lead, config: ConfiguracaoChat): Promise<void> {
        const leadData = {
            ...lead,
            consultantName: config.consultantName,
            assistantName: config.assistantName,
        };
        await this.crmService.enviarLead(leadData, config.webhookId);
    }
}

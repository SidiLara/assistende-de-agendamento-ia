import { Mensagem } from './modelos/MensagemModel';
import { Lead } from './modelos/LeadModel';
import { ConfiguracaoChat } from './modelos/ConfiguracaoChatModel';
import { RespostaAi } from './modelos/RespostaAi';

export interface ManipuladorDeFluxo {
    proximo(contexto: ContextoDeFluxo): Promise<void>;
}

export interface ContextoDeFluxo {
    config: ConfiguracaoChat;
    historico: Mensagem[];
    lead: Lead;
    respostaAi: RespostaAi | null;
    adicionarMensagem(mensagem: Mensagem): void;
    atualizarLead(dadosDoLead: Partial<Lead>): void;
    obterLead(): Lead;
}

export interface RegraDeFallback {
    aplicar(lead: Lead, config: ConfiguracaoChat): string | null;
}

export interface ServicoDeChat {
    analisarMensagem(config: ConfiguracaoChat, lead: Lead, historico: Mensagem[]): Promise<RespostaAi>;
    enviarLead(lead: Lead, config: ConfiguracaoChat): Promise<void>;
}

export interface OpcaoDeAcao {
    label: string;
    valor: string;
    chave: string;
}

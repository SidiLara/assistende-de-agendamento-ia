import { ConfiguracaoChat } from './modelos/ConfiguracaoChatModel';
import { Lead } from './modelos/LeadModel';
import { RegraDeFallback } from './InterfacesChat';

export class RegraFallbackImpl implements RegraDeFallback {
    aplicar(lead: Lead, config: ConfiguracaoChat): string | null {
        if (!lead.nome) {
            return `Como posso te chamar?`;
        }
        if (!lead.email) {
            return `Qual é o seu melhor e-mail para contato?`;
        }
        if (!lead.telefone) {
            return `Poderia me informar seu número de WhatsApp para continuarmos a conversa por lá?`;
        }
        if (!lead.necessidades || lead.necessidades.length === 0) {
            return `Para quais dos seus projetos você acredita que a IA poderia ser útil?`;
        }
        if (!lead.servicos || lead.servicos.length === 0) {
            return `Quais dos meus serviços mais te interessam? Estou aqui para ajudar a encontrar a solução ideal para você.`
        }
        if (!lead.orcamento) {
            return `Qual a sua faixa de orçamento para este projeto? Isso me ajuda a alinhar as soluções certas para você.`
        }
        
        return "Não entendi muito bem, você poderia repetir, por favor?";
    }
}

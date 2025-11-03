import { Lead } from './LeadModel';

export interface RespostaAi {
    tipo: 'pergunta' | 'json' | 'despedida' | 'correcao' | 'confirmacao' | 'agendamento';
    texto: string;
    lead?: Lead;
    campo?: keyof Lead;
    novoValor?: string;
}

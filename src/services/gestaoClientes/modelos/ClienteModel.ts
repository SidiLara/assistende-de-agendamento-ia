import { TipoPlano, TipoPagamento } from "../../gestaoCrm/modelos/ConsultorModel";

export type StatusCliente = 'Ativo' | 'Inativo' | 'Pendente';
export type TipoEntidade = 'Cliente' | 'Consultor';

export interface Cliente {
    id: string;
    nome: string;
    plano: TipoPlano;
    telefone: string;
    status: StatusCliente;
    dataInicio: string; // Formato YYYY-MM-DD
    tipoPagamento: TipoPagamento;
    numeroParcelas?: number;
    tipo: TipoEntidade;
}

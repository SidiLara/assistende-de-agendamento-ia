export type TipoPlano = 'Premium' | 'Básico' | 'Empresarial';
export type StatusCliente = 'Ativo' | 'Inativo';
export type TipoPagamento = 'Fixo' | 'Parcelado';
export type TipoEntidade = 'Cliente' | 'Consultor';

export interface Cliente {
    id: string;
    nome: string;
    tipo: TipoEntidade;
    plano: TipoPlano;
    telefone: string;
    status: StatusCliente;
    dataInicio: string; // Formato YYYY-MM-DD
    tipoPagamento: TipoPagamento;
    numeroParcelas?: number;
}

export type TipoPlano = 'Premium' | 'Básico';
export type TipoPagamento = 'Fixo' | 'Parcelado';

export interface Consultor {
    id: string;
    nome: string;
    plano: TipoPlano;
    telefone: string;
    dataInicio: string; // Formato YYYY-MM-DD
    tipoPagamento: TipoPagamento;
    numeroParcelas?: number;
}

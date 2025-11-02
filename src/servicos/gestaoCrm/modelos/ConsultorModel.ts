export type TipoPlano = 'Premium' | 'Básico';

export interface Consultor {
    id: string;
    nome: string;
    plano: TipoPlano;
    telefone: string;
}

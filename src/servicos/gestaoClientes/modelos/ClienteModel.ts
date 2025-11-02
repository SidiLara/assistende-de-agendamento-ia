export type TipoPlano = 'Premium' | 'Básico' | 'Empresarial';

export interface Cliente {
    id: string;
    nome: string;
    plano: TipoPlano;
    telefone: string;
}
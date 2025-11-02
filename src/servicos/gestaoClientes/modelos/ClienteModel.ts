export type TipoPlano = 'Premium' | 'Básico' | 'Empresarial';
export type StatusCliente = 'Ativo' | 'Inativo';

export interface Cliente {
    id: string;
    nome: string;
    plano: TipoPlano;
    telefone: string;
    status: StatusCliente;
}

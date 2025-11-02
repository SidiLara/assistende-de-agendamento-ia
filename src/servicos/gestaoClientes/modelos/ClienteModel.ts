export type StatusCliente = 'Novo' | 'Em Contato' | 'Agendado' | 'Convertido' | 'Perdido';

export interface Cliente {
    id: string;
    nome: string;
    telefone: string;
    email: string;
    status: StatusCliente;
    consultorResponsavel: string; // Nome do consultor
    dataAgendamento?: string;
}

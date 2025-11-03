export interface Transacao {
    id: string;
    dataVenda: string;
    clienteId: string;
    planoId: string; // ou nome do plano, dependendo do que for mais útil
    consultorId: string;
    valor: number;
}

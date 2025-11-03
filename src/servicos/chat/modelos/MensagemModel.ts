export interface Mensagem {
    texto: string;
    remetente: 'usuario' | 'assistente';
    timestamp: number;
    id: string;
    delay?: number;
}

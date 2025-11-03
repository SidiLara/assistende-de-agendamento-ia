export enum RemetenteMensagem {
    User = 'user',
    Bot = 'bot',
}

export interface Mensagem {
    id: number;
    sender: RemetenteMensagem;
    text: string;
    isNotice?: boolean;
}
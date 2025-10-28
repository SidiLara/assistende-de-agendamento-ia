export enum MessageSender {
    User = 'user',
    Bot = 'bot',
}

export interface Message {
    id: number;
    sender: MessageSender;
    text: string;
}

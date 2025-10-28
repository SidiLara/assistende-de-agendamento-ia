import { Message } from '../model/mensagem/MensagemModel';

export interface ChatBodyProps {
    messages: Message[];
    isTyping: boolean;
}
import { Message } from '../../model/mensagem/MensagemModel';

export interface CorpoDoChatProps {
    messages: Message[];
    isTyping: boolean;
}

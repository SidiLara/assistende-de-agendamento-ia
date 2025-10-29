import { Message } from '../../servicos/modelos/MensagemModel';

export interface CorpoDoChatProps {
    messages: Message[];
    isTyping: boolean;
}

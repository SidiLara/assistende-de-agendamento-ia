import { Message } from '../../servicos/modelos/Mensagem';

export interface CorpoDoChatProps {
    messages: Message[];
    isTyping: boolean;
}

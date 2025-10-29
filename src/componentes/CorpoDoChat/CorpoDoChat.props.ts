import { Message } from '../../servicos/modelos/Mensagem.model';

export interface CorpoDoChatProps {
    messages: Message[];
    isTyping: boolean;
}

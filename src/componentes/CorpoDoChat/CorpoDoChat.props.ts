import { Mensagem } from '../../services/chat/modelos/MensagemModel';

export interface CorpoDoChatProps {
    messages: Mensagem[];
    isTyping: boolean;
    consultantPhoto: string;
}
import { Mensagem } from '../../servicos/chat/modelos/MensagemModel';

export interface CorpoDoChatProps {
    messages: Mensagem[];
    isTyping: boolean;
    consultantPhoto: string;
}
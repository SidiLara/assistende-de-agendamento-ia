import { Mensagem } from '../../services/chat/modelos/MensagemModel';

export interface MensagemDeChatProps {
    message: Mensagem;
    consultantPhoto: string;
}
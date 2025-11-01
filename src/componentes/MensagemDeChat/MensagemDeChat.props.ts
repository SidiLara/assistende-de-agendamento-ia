import { Mensagem } from '../../servicos/chat/modelos/MensagemModel';

export interface MensagemDeChatProps {
    message: Mensagem;
    consultantPhoto: string;
    onPlayAudio: (text: string, messageId: number) => void;
    isPlaying: boolean;
    isLoading: boolean;
}

import { Mensagem } from '../../servicos/chat/modelos/MensagemModel';

export interface CorpoDoChatProps {
    messages: Mensagem[];
    isTyping: boolean;
    consultantPhoto: string;
    onPlayAudio: (text: string, messageId: number) => void;
    isPlaying: (messageId: number) => boolean;
    isLoading: (messageId: number) => boolean;
}

import { LeadKey } from '../../services/chat/modelos/LeadModel';

export interface EntradaDeChatProps {
    onSendMessage: (text: string) => void;
    isSending: boolean;
    isDone: boolean;
    isActionPending: boolean;
    nextKey: LeadKey | null;
    assistantName: string;
}
import { LeadDataKey } from '../../servicos/modelos/LeadModel';

export interface EntradaDeChatProps {
    onSendMessage: (text: string) => void;
    isSending: boolean;
    isDone: boolean;
    isActionPending: boolean;
    nextKey: LeadDataKey | null;
}

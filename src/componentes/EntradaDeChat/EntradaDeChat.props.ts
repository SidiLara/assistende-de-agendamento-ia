import { LeadDataKey } from '../../servicos/modelos/Lead';

export interface EntradaDeChatProps {
    onSendMessage: (text: string) => void;
    isSending: boolean;
    isDone: boolean;
    isActionPending: boolean;
    nextKey: LeadDataKey | null;
}

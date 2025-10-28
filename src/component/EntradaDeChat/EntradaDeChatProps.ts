import { LeadDataKey } from '../../model/lead/LeadModel';

export interface EntradaDeChatProps {
    onSendMessage: (text: string) => void;
    isSending: boolean;
    isDone: boolean;
    isActionPending: boolean;
    nextKey: LeadDataKey | null;
}

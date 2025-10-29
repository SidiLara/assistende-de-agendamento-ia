import { LeadDataKey } from '../../model/lead/LeadModel';
import { EntradaDeChatEvent } from './EntradaDeChatEvent';

export interface EntradaDeChatProps extends EntradaDeChatEvent {
    isSending: boolean;
    isDone: boolean;
    isActionPending: boolean;
    nextKey: LeadDataKey | null;
}

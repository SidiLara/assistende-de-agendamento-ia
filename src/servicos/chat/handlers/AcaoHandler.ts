import { Mensagem } from '../modelos/MensagemModel';
import { Lead, LeadKey } from '../modelos/LeadModel';

export interface FlowResult {
    newMessages?: Mensagem[];
    updatedLeadData?: Partial<Lead>;
    newActionOptions?: { label: string; value: string; }[];
    newIsActionPending?: boolean;
    newNextKey?: LeadKey | null;
    newIsCorrecting?: boolean;
    newIsDone?: boolean;
    newTriggeredObjection?: string;
}

export interface AcaoHandler<T> {
    handle(params: T): Promise<FlowResult>;
}

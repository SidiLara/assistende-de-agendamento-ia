import { Mensagem } from '../modelos/MensagemModel';
import { Lead, LeadKey } from '../modelos/LeadModel';

export interface ResultadoFluxo {
    newMessages?: Mensagem[];
    updatedLeadData?: Partial<Lead>;
    newActionOptions?: { label: string; value: string; }[];
    newIsActionPending?: boolean;
    newNextKey?: LeadKey | null;
    newIsCorrecting?: boolean;
    newIsDone?: boolean;
    // FIX: Added optional property to fix type error in ManipuladorMensagemUsuario.
    newTriggeredObjection?: string;
}

export interface ManipuladorAcao<T> {
    handle(params: T): Promise<ResultadoFluxo>;
}
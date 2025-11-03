import { Mensagem } from './modelos/MensagemModel';
import { Lead, LeadKey } from './modelos/LeadModel';
import { ResultadoFluxo } from './handlers/ManipuladorAcao';

export interface SendCrmOptions {
    isFallback: boolean;
    objections: string[];
}

export interface MessageHandlerParams {
    text: string;
    currentHistory: Mensagem[];
    leadData: Partial<Lead>;
    nextKey: LeadKey | null;
    isFallbackMode: boolean;
    isErrorRecovery?: boolean;
}

export interface PillSelectionHandlerParams {
    value: string;
    leadData: Partial<Lead>;
    isCorrecting: boolean;
    isFallbackMode: boolean;
    currentHistory: Mensagem[];
}

export interface IManipuladorFluxoChat {
    processUserMessage(params: MessageHandlerParams): Promise<ResultadoFluxo>;
    processPillSelection(params: PillSelectionHandlerParams): Promise<ResultadoFluxo>;
}

export interface ConfirmationHandlerParams extends PillSelectionHandlerParams {}
export interface CorrectionHandlerParams extends PillSelectionHandlerParams {}
export interface DateTimeSelectionHandlerParams extends PillSelectionHandlerParams {}
export interface UserMessageHandlerParams extends MessageHandlerParams {}
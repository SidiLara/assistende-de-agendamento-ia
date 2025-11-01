import { Mensagem } from './modelos/MensagemModel';
import { Lead, LeadKey } from './modelos/LeadModel';
import { FlowResult } from './handlers/AcaoHandler';
import { ConfiguracaoChat } from './modelos/ConfiguracaoChatModel';

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
    triggeredObjections: string[];
    currentHistory: Mensagem[];
}

export interface IChatFlowHandler {
    processUserMessage(params: MessageHandlerParams): Promise<FlowResult>;
    processPillSelection(params: PillSelectionHandlerParams): Promise<FlowResult>;
}

export interface ConfirmationHandlerParams extends PillSelectionHandlerParams {}
export interface CorrectionHandlerParams extends PillSelectionHandlerParams {}
export interface DateTimeSelectionHandlerParams extends PillSelectionHandlerParams {}
export interface UserMessageHandlerParams extends MessageHandlerParams {}
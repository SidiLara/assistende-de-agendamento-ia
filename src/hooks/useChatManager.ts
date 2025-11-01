import * as React from 'react';
import { Mensagem, RemetenteMensagem } from '../servicos/chat/modelos/MensagemModel';
import { Lead, LeadKey } from '../servicos/chat/modelos/LeadModel';
import { ConfiguracaoChat } from '../servicos/chat/modelos/ConfiguracaoChatModel';
import { ServicoChat } from '../servicos/chat/ChatService';
// FIX: `FlowResult` is not exported from `ChatFlowHandler`. It's defined in `AcaoHandler`.
// Importing it from its source file resolves the module resolution error.
import { ChatFlowHandler } from '../servicos/chat/ChatFlowHandler';
import { FlowResult } from '../servicos/chat/handlers/AcaoHandler';
import { IChatFlowHandler } from '../servicos/chat/ChatInterfaces';

export const useChatManager = (config: ConfiguracaoChat | null, chatService: ServicoChat | null) => {
    const [messages, setMessages] = React.useState<Mensagem[]>([]);
    const [leadData, setLeadData] = React.useState<Partial<Lead>>({});
    const [isTyping, setIsTyping] = React.useState<boolean>(false);
    const [isSending, setIsSending] = React.useState<boolean>(false);
    const [isDone, setIsDone] = React.useState<boolean>(false);
    const [actionOptions, setActionOptions] = React.useState<{ label: string; value: string; }[]>([]);
    const [isActionPending, setIsActionPending] = React.useState<boolean>(false);
    const [nextKey, setNextKey] = React.useState<LeadKey | null>(null);
    const [isCorrecting, setIsCorrecting] = React.useState<boolean>(false);
    const [isFallbackMode, setIsFallbackMode] = React.useState<boolean>(false);
    const [triggeredObjections, setTriggeredObjections] = React.useState<string[]>([]);
    
    const chatFlowHandler = React.useMemo<IChatFlowHandler | null>(() => {
        if (!chatService || !config) return null;
        return new ChatFlowHandler(chatService, config);
    }, [chatService, config]);


    React.useEffect(() => {
        if (!config) return;
        const urlParams = new URLSearchParams(window.location.search);
        const sourceParam = urlParams.get('origem') || urlParams.get('source') || urlParams.get('utm_source');
        const initialData: Partial<Lead> = { source: sourceParam || 'Direto' };
        setLeadData(initialData);
    }, [config]);

    const updateStateFromFlowResult = (result: FlowResult) => {
        if (result.newMessages) setMessages(prev => [...prev, ...result.newMessages!]);
        if (result.updatedLeadData) setLeadData(result.updatedLeadData);
        if (result.newActionOptions !== undefined) setActionOptions(result.newActionOptions);
        if (result.newIsActionPending !== undefined) setIsActionPending(result.newIsActionPending);
        if (result.newNextKey !== undefined) setNextKey(result.newNextKey);
        if (result.newIsCorrecting !== undefined) setIsCorrecting(result.newIsCorrecting);
        if (result.newIsDone !== undefined) setIsDone(result.newIsDone);
        if (result.newTriggeredObjection) setTriggeredObjections(prev => [...prev, result.newTriggeredObjection!]);
    };

    const handleSendMessage = React.useCallback(async (text: string) => {
        if (isSending || isDone || !chatFlowHandler) return;

        const userMessage: Mensagem = { id: Date.now(), sender: RemetenteMensagem.User, text };
        setMessages(prev => [...prev, userMessage]);
        setIsSending(true);
        setIsTyping(true);
        setActionOptions([]);
        setIsActionPending(false);

        try {
            const result = await chatFlowHandler.processUserMessage({
                text,
                currentHistory: [...messages, userMessage],
                leadData,
                nextKey,
                isFallbackMode,
            });
            updateStateFromFlowResult(result);
        } catch (error) {
            console.error("Falha no fluxo de mensagem, ativando fallback.", error);
            setIsFallbackMode(true);
            const fallbackResult = await chatFlowHandler.processUserMessage({
                text,
                currentHistory: [...messages, userMessage],
                leadData,
                nextKey,
                isFallbackMode: true, 
                isErrorRecovery: true,
            });
            updateStateFromFlowResult(fallbackResult);
        } finally {
            setIsTyping(false);
            setIsSending(false);
        }
    }, [isSending, isDone, chatFlowHandler, messages, nextKey, leadData, isFallbackMode]);

    const handlePillSelect = React.useCallback(async (value: string, label?: string) => {
        if (!chatFlowHandler) return;
    
        setActionOptions([]);
        setIsActionPending(false);
        setIsTyping(true);
        
        // Adiciona a seleção do usuário como uma mensagem no chat, se aplicável
        if (label) {
            const userMessage: Mensagem = { id: Date.now(), sender: RemetenteMensagem.User, text: label };
            setMessages(prev => [...prev, userMessage]);
        }
        
        try {
             const result = await chatFlowHandler.processPillSelection({
                value,
                leadData,
                isCorrecting,
                isFallbackMode,
                triggeredObjections,
                currentHistory: messages,
             });
             updateStateFromFlowResult(result);
        } catch(error) {
            console.error("Falha ao processar a seleção da pill:", error);
            const errorMessage: Mensagem = { id: Date.now(), sender: RemetenteMensagem.Bot, text: "Opa, tivemos um problema ao processar sua escolha. Nossa equipe já foi notificada." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    }, [chatFlowHandler, leadData, messages, isCorrecting, isFallbackMode, triggeredObjections]);

    return {
        messages,
        isTyping,
        isSending,
        isDone,
        actionOptions,
        isActionPending,
        nextKey,
        handleSendMessage,
        handlePillSelect,
    };
};
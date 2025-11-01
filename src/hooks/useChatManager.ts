import * as React from 'react';
import { Mensagem, RemetenteMensagem } from '../servicos/chat/modelos/MensagemModel';
import { Lead, LeadKey } from '../servicos/chat/modelos/LeadModel';
import { ConfiguracaoChat } from '../servicos/chat/modelos/ConfiguracaoChatModel';
import { calculateFullDate } from '../utils/formatters/DateAndTime';
import { ServicoChat } from '../servicos/chat/ChatService';

const CORRECTION_FIELD_LABELS: Record<string, string> = {
    clientName: 'Nome',
    topic: 'Objetivo',
    creditAmount: 'Valor do Crédito',
    monthlyInvestment: 'Reserva Mensal',
    clientWhatsapp: 'WhatsApp',
    clientEmail: 'E-mail',
    meetingType: 'Tipo de Reunião',
    startDatetime: 'Data/Hora'
};

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
    const [hasShownSummary, setHasShownSummary] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!config) return;

        // Apenas configura os dados iniciais, sem iniciar a conversa.
        // A conversa agora é iniciada pelo usuário.
        const urlParams = new URLSearchParams(window.location.search);
        const sourceParam = urlParams.get('origem') || urlParams.get('source') || urlParams.get('utm_source');
        const initialData: Partial<Lead> = { source: sourceParam || 'Direto' };
        setLeadData(initialData);

    }, [config]);


    const showSummaryAndActions = React. useCallback(async (data: Partial<Lead>) => {
        if (!config || !chatService) return;

        setIsTyping(true);
        
        const dateTimeString = data.startDatetime || '';
        const dayMatch = dateTimeString.match(/(\b(domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado)\b)/i);
        const timeMatch = dateTimeString.match(/(\d{1,2}[:h]?\d{0,2})/);
        const dayOfWeek = dayMatch ? dayMatch[1] : '';
        const time = timeMatch ? timeMatch[0] : '';
        const finalDate = calculateFullDate(dayOfWeek, time);
        
        const finalLeadData = { ...data, startDatetime: finalDate };
        setLeadData(finalLeadData);
        
        const summaryText = (isFallbackMode || hasShownSummary) 
            ? chatService.getFallbackSummary(finalLeadData) 
            : await chatService.getFinalSummary(finalLeadData, config);
            
        setLeadData(prev => ({ ...prev, finalSummary: summaryText }));

        const summaryMessage: Mensagem = { id: Date.now() + 2, sender: RemetenteMensagem.Bot, text: summaryText };
        setMessages(prev => [...prev, summaryMessage]);

        setActionOptions([
            { label: 'Confirmar Agendamento', value: 'confirm' },
            { label: 'Corrigir Informações', value: 'correct' },
        ]);
        setIsActionPending(true);
        setIsTyping(false);
        if (!hasShownSummary) {
            setHasShownSummary(true);
        }
    }, [config, chatService, isFallbackMode, hasShownSummary]);

    const handleSendMessage = React.useCallback(async (text: string) => {
        if (isSending || isDone || !config || !chatService) return;

        const userMessage: Mensagem = { id: Date.now(), sender: RemetenteMensagem.User, text };
        const currentHistory = [...messages, userMessage];
        setMessages(currentHistory);
        setIsSending(true);
        setIsTyping(true);
        setActionOptions([]);
        setIsActionPending(false);

        if (nextKey === 'clientWhatsapp') {
            const justDigits = text.replace(/\D/g, '');
            if (justDigits.length < 10 || justDigits.length > 11) {
                const errorMessage: Mensagem = {
                    id: Date.now() + 1,
                    sender: RemetenteMensagem.Bot,
                    text: "Hmm, não consegui identificar um número de WhatsApp válido. Por favor, insira o número com DDD no formato <strong>(XX) 9XXXX-XXXX</strong>."
                };
                setMessages(prev => [...prev, errorMessage]);
                setIsTyping(false);
                setIsSending(false);
                return;
            }
        }

        if (nextKey === 'clientEmail') {
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
            if (!text.match(emailRegex)) {
                const errorMessage: Mensagem = {
                    id: Date.now() + 1,
                    sender: RemetenteMensagem.Bot,
                    text: "Parece que o e-mail informado não é válido. Por favor, verifique e tente novamente."
                };
                setMessages(prev => [...prev, errorMessage]);
                setIsTyping(false);
                setIsSending(false);
                return;
            }
        }
        
        let response;
        try {
            if (isFallbackMode) {
                response = chatService.getFallbackResponse(text, leadData, nextKey, config);
            } else {
                response = await chatService.getAiResponse(currentHistory, leadData, config);
            }

            const newLeadData = { ...leadData, ...response.updatedLeadData };
            setLeadData(newLeadData);

            if (response.responseText) {
                const botMessage: Mensagem = { id: Date.now() + 1, sender: RemetenteMensagem.Bot, text: response.responseText };
                setMessages(prev => [...prev, botMessage]);
            }

            if (response.action === 'SHOW_DAY_OPTIONS') {
                 setActionOptions([
                    { label: 'Segunda-feira', value: 'Segunda-feira' },
                    { label: 'Terça-feira', value: 'Terça-feira' },
                    { label: 'Quarta-feira', value: 'Quarta-feira' },
                    { label: 'Quinta-feira', value: 'Quinta-feira' },
                    { label: 'Sexta-feira', value: 'Sexta-feira' },
                    { label: 'Sábado', value: 'Sábado' },
                    { label: 'Domingo', value: 'Domingo' },
                ]);
                setIsActionPending(true);
            }

            setNextKey(response.nextKey);

            if (response.nextKey === null) {
                await showSummaryAndActions(newLeadData);
            }

        } catch (error) {
            console.error("API call failed, switching to fallback mode.", error);
            setIsFallbackMode(true);
            const fallbackNotice: Mensagem = { 
                id: Date.now() + 1, 
                sender: RemetenteMensagem.Bot, 
                text: "Tivemos um problema de comunicação com a inteligência artificial. Para não te deixar esperando, vamos continuar de forma mais direta.",
                isNotice: true,
            };
            const fallbackResponse = chatService.getFallbackResponse(text, leadData, nextKey, config);
            const newLeadData = { ...leadData, ...fallbackResponse.updatedLeadData };
            setLeadData(newLeadData);
            
            const fallbackQuestion: Mensagem = { id: Date.now() + 2, sender: RemetenteMensagem.Bot, text: fallbackResponse.responseText };
            setMessages(prev => [...prev, fallbackNotice, fallbackQuestion]);
            setNextKey(fallbackResponse.nextKey);
        } finally {
            setIsTyping(false);
            setIsSending(false);
        }
    }, [isSending, isDone, config, chatService, messages, nextKey, leadData, isFallbackMode, showSummaryAndActions]);

    const handlePillSelect = React.useCallback(async (value: string, label?: string) => {
        if (!config || !chatService) return;
    
        setActionOptions([]);
        setIsActionPending(false);
    
        if (value === 'confirm') {
            setIsTyping(true);
            try {
                // FIX: Add type assertion to window to fix TypeScript error for 'fbq'
                if ((window as any).fbq) {
                    (window as any).fbq('track', 'Schedule');
                }
                await chatService.sendLeadToCRM(leadData, messages, config);
                const confirmationMessage: Mensagem = { id: Date.now(), sender: RemetenteMensagem.Bot, text: "Tudo certo! Seu agendamento foi confirmado. Em breve, um de nossos consultores entrará em contato com você. Obrigado!" };
                setMessages(prev => [...prev, confirmationMessage]);
                setIsDone(true);
            } catch (error) {
                console.error("Failed to send lead to CRM:", error);
                const errorMessage: Mensagem = { id: Date.now(), sender: RemetenteMensagem.Bot, text: "Opa, tivemos um problema ao confirmar seu agendamento. Nossa equipe já foi notificada. Por favor, aguarde que entraremos em contato." };
                setMessages(prev => [...prev, errorMessage]);
            }
            setIsTyping(false);
    
        } else if (value === 'correct') {
            setIsCorrecting(true);
            const correctionOptions = Object.entries(leadData)
                .filter(([key]) => CORRECTION_FIELD_LABELS[key])
                .map(([key, value]) => ({
                    label: `${CORRECTION_FIELD_LABELS[key]}: ${key === 'creditAmount' || key === 'monthlyInvestment' ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number) : value}`,
                    value: key
                }));
            setActionOptions(correctionOptions);
            setIsActionPending(true);
            const correctionPrompt: Mensagem = { id: Date.now(), sender: RemetenteMensagem.Bot, text: "Sem problemas! O que você gostaria de corrigir?" };
            setMessages(prev => [...prev, correctionPrompt]);
    
        } else if (isCorrecting) {
            if (value === 'startDatetime') {
                setIsCorrecting(false);
                setLeadData(prev => {
                    const { startDatetime, ...rest } = prev;
                    return rest;
                });
                
                const rescheduleMessage: Mensagem = { 
                    id: Date.now(), 
                    sender: RemetenteMensagem.Bot, 
                    text: "Ok, vamos reagendar. Por favor, escolha o melhor <strong>dia da semana</strong> para a nossa conversa." 
                };
                setMessages(prev => [...prev, rescheduleMessage]);
                
                setActionOptions([
                    { label: 'Segunda-feira', value: 'Segunda-feira' },
                    { label: 'Terça-feira', value: 'Terça-feira' },
                    { label: 'Quarta-feira', value: 'Quarta-feira' },
                    { label: 'Quinta-feira', value: 'Quinta-feira' },
                    { label: 'Sexta-feira', value: 'Sexta-feira' },
                    { label: 'Sábado', value: 'Sábado' },
                    { label: 'Domingo', value: 'Domingo' },
                ]);
                setIsActionPending(true);
                setNextKey('startDatetime');
            } else {
                setNextKey(value as LeadKey);
                setLeadData(prev => {
                    const keyToRemove = value as LeadKey;
                    const { [keyToRemove]: _, ...rest } = prev;
                    return rest;
                });
                setIsCorrecting(false);
                const askAgainMessage: Mensagem = { id: Date.now(), sender: RemetenteMensagem.Bot, text: `Ok, vamos ajustar. Por favor, me informe o novo valor para: <strong>${CORRECTION_FIELD_LABELS[value]}</strong>.` };
                setMessages(prev => [...prev, askAgainMessage]);
            }
    
        } else { // Day or Time selection
            const selectedText = label || value;
            const userMessage: Mensagem = { id: Date.now(), sender: RemetenteMensagem.User, text: selectedText };
            setMessages(prev => [...prev, userMessage]);
            setIsTyping(true);
            
            // Check if it's a time selection (because a day is already set)
            if (leadData.startDatetime && !leadData.startDatetime.includes('às')) {
                const finalDateTime = `${leadData.startDatetime} às ${value}`;
                const finalData = { ...leadData, startDatetime: finalDateTime };
                setLeadData(finalData);
                // All date/time info collected, proceed to summary
                showSummaryAndActions(finalData);
            } else { // It's a day selection
                const updatedData = { ...leadData, startDatetime: selectedText };
                setLeadData(updatedData);
        
                const response = chatService.getFallbackResponse(selectedText, updatedData, 'startDatetime', config);
        
                if (response.responseText) {
                    const botMessage: Mensagem = { id: Date.now() + 1, sender: RemetenteMensagem.Bot, text: response.responseText };
                    setMessages(prev => [...prev, botMessage]);
                }
                if (response.options) {
                    setActionOptions(response.options);
                    setIsActionPending(true);
                }
                setNextKey(response.nextKey);
            }
            setIsTyping(false);
        }
    }, [config, chatService, leadData, messages, isCorrecting, showSummaryAndActions]);

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

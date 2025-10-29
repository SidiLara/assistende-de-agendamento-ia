import * as React from 'react';
import { Message, MessageSender } from '../../model/mensagem/MensagemModel';
import { LeadData, LeadDataKey } from '../../model/lead/LeadModel';
import { ChatConfig } from '../../model/configuracao/ConfiguracaoChatModel';
import { calculateFullDate } from '../../core/formatters/DateAndTime';
import { parseHumanNumber } from '../../core/formatters/Number';
import { ChatService } from '../service/ChatService';

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

export const useChatManager = (config: ChatConfig | null, chatService: ChatService | null) => {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [leadData, setLeadData] = React.useState<Partial<LeadData>>({});
    const [isTyping, setIsTyping] = React.useState<boolean>(true);
    const [isSending, setIsSending] = React.useState<boolean>(false);
    const [isDone, setIsDone] = React.useState<boolean>(false);
    const [actionOptions, setActionOptions] = React.useState<{ label: string; value: string; }[]>([]);
    const [isActionPending, setIsActionPending] = React.useState<boolean>(false);
    const [nextKey, setNextKey] = React.useState<LeadDataKey | null>(null);
    const [isCorrecting, setIsCorrecting] = React.useState<boolean>(false);
    const [isFallbackMode, setIsFallbackMode] = React.useState<boolean>(false);
    const [hasShownSummary, setHasShownSummary] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!config || !chatService) return;

        const urlParams = new URLSearchParams(window.location.search);
        const sourceParam = urlParams.get('origem') || urlParams.get('source') || urlParams.get('utm_source');
        const initialData: Partial<LeadData> = { source: sourceParam || 'Direto' };
        setLeadData(initialData);

        const fetchWelcomeMessage = async () => {
            setIsTyping(true);
            const initialHistory: Message[] = [];
            try {
                const { responseText, nextKey: newNextKeyFromAI } = await chatService.getAiResponse(initialHistory, initialData, config);
                setMessages([{ id: Date.now(), sender: MessageSender.Bot, text: responseText }]);
                setNextKey(newNextKeyFromAI);
            } catch (error) {
                console.error("Initial API call failed, starting in fallback mode.", error);
                setIsFallbackMode(true);
                const fallbackNotice: Message = { 
                    id: Date.now(), 
                    sender: MessageSender.Bot, 
                    text: "Estamos com instabilidade na conexão com a IA. Para garantir seu atendimento, vamos continuar em um modo mais direto.",
                    isNotice: true,
                };
                const { responseText, nextKey } = chatService.getFallbackResponse("", initialData, null, config);
                const firstQuestion: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: responseText };
                setMessages([fallbackNotice, firstQuestion]);
                setNextKey(nextKey);
            }
            setIsTyping(false);
        };
        fetchWelcomeMessage();
    }, [config, chatService]);


    const showSummaryAndActions = React.useCallback(async (data: Partial<LeadData>) => {
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

        const summaryMessage: Message = { id: Date.now() + 2, sender: MessageSender.Bot, text: summaryText };
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

        const userMessage: Message = { id: Date.now(), sender: MessageSender.User, text };
        const currentHistory = [...messages, userMessage];
        setMessages(currentHistory);
        setIsSending(true);
        setIsTyping(true);
        setActionOptions([]);
        setIsActionPending(false);

        if (nextKey === 'clientWhatsapp') {
            const justDigits = text.replace(/\D/g, '');
            if (justDigits.length < 10 || justDigits.length > 11) {
                const errorMessage: Message = {
                    id: Date.now() + 1,
                    sender: MessageSender.Bot,
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
                const errorMessage: Message = {
                    id: Date.now() + 1,
                    sender: MessageSender.Bot,
                    text: "Opa, esse e-mail não parece válido. Por favor, poderia verificar e inserir novamente?"
                };
                setMessages(prev => [...prev, errorMessage]);
                setIsTyping(false);
                setIsSending(false);
                return;
            }
        }

        try {
            let response;
            if (isFallbackMode || hasShownSummary) {
                 response = chatService.getFallbackResponse(text, leadData, nextKey, config);
            } else {
                 response = await chatService.getAiResponse(currentHistory, leadData, config);
            }
            
            const { updatedLeadData, responseText, action, nextKey: newNextKeyFromAI } = response;
            
            if (nextKey === 'creditAmount') {
                let creditValue = updatedLeadData.creditAmount ? Number(updatedLeadData.creditAmount) : NaN;
        
                if (creditValue < 15000) {
                    const reParsedValue = parseHumanNumber(text, true);
                    if (!isNaN(reParsedValue) && reParsedValue >= 15000) {
                        creditValue = reParsedValue;
                        updatedLeadData.creditAmount = creditValue;
                    }
                }
                
                if (isNaN(creditValue) || creditValue < 15000) {
                    const errorMessage: Message = {
                        id: Date.now() + 1,
                        sender: MessageSender.Bot,
                        text: "Entendi. Para que a gente possa encontrar o melhor plano, o <strong>valor mínimo de crédito</strong> é de R$ 15.000,00. Qual seria o <strong>valor que você tem em mente</strong>?"
                    };
                    setMessages(prev => [...prev, errorMessage]);
                    setIsTyping(false);
                    setIsSending(false);
                    return;
                }
            }
            
            const newLeadData = { ...leadData, ...updatedLeadData };
            setLeadData(newLeadData);
            
            if (isCorrecting) {
                setIsCorrecting(false);
                setNextKey(null);
                await showSummaryAndActions(newLeadData);
            } else {
                setNextKey(newNextKeyFromAI);

                if (responseText) {
                    const botMessage: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: responseText };
                    setMessages(prev => [...prev, botMessage]);
                }

                const allDataNowCollected = newNextKeyFromAI === null;
                
                if (allDataNowCollected) {
                    await showSummaryAndActions(newLeadData);
                } else if (action === 'SHOW_DAY_OPTIONS') {
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
                    setIsTyping(false);
                } else {
                    setIsTyping(false);
                }
            }
        } catch (error) {
            console.error("API Error, switching to fallback mode:", error);
            setIsFallbackMode(true);

            const fallbackNotice: Message = { 
                id: Date.now() + 1, 
                sender: MessageSender.Bot, 
                text: "Desculpe, a instabilidade na conexão persiste. Continuaremos no modo direto para não te deixar sem resposta, ok?",
                isNotice: true
            };
            setMessages(prev => [...prev, fallbackNotice]);

            const { responseText, nextKey: fallbackNextKey } = chatService.getFallbackResponse(text, leadData, nextKey, config);
            const fallbackQuestion: Message = { id: Date.now() + 2, sender: MessageSender.Bot, text: responseText };
            setMessages(prev => [...prev, fallbackQuestion]);
            setNextKey(fallbackNextKey);
            setIsTyping(false);
        } finally {
            setIsSending(false);
        }
    }, [config, chatService, isSending, isDone, messages, leadData, nextKey, isFallbackMode, isCorrecting, showSummaryAndActions, hasShownSummary]);
    
    const handleCorrection = React.useCallback(async (keyToCorrect: LeadDataKey) => {
        if (!config || !chatService) return;

        setActionOptions([]);
        setIsActionPending(false);

        const newLeadData = { ...leadData };
        delete newLeadData[keyToCorrect];
        if (keyToCorrect === 'startDatetime') delete newLeadData.finalSummary;
        setLeadData(newLeadData);

        setNextKey(keyToCorrect);
        setIsTyping(true);

        const { responseText, nextKey: newNextKey, action } = chatService.getFallbackResponse("", newLeadData, keyToCorrect, config);
        if (responseText) {
            const botMessage: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: responseText };
            setMessages(prev => [...prev, botMessage]);
        }
        setNextKey(newNextKey);
        if (action === 'SHOW_DAY_OPTIONS') {
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
        
        setIsTyping(false);
    }, [config, chatService, leadData]);


    const handlePillSelect = React.useCallback(async (value: string, label?: string) => {
        if (!config || !chatService) return;
    
        if (value === 'confirm') {
            setActionOptions([]);
            setIsActionPending(false);
            setIsTyping(true);
            const currentMessages = [...messages];
    
            const sendingMessage: Message = {
                id: Date.now(),
                sender: MessageSender.Bot,
                text: "Um momento, estou confirmando os detalhes e enviando para o consultor..."
            };
            setMessages(prev => [...prev, sendingMessage]);
    
            try {
                await chatService.sendLeadToCRM(leadData, currentMessages, config);
                
                if (window.fbq) {
                    window.fbq('track', 'Lead');
                }
                
                setMessages(prev => {
                    const newMessages = prev.filter(m => m.id !== sendingMessage.id);
                    const finalMessage: Message = { 
                        id: Date.now() + 1, 
                        sender: MessageSender.Bot, 
                        text: `Perfeito! Seu agendamento foi confirmado. ${config.consultantName} entrará em contato com você em breve. Obrigado!` 
                    };
                    return [...newMessages, finalMessage];
                });
                setIsDone(true);
    
            } catch (error) {
                console.error("Failed to send lead to CRM:", error);
                setMessages(prev => {
                    const newMessages = prev.filter(m => m.id !== sendingMessage.id);
                    const errorMessage: Message = { 
                        id: Date.now() + 1, 
                        sender: MessageSender.Bot, 
                        text: "Opa! Tivemos um problema ao registrar seu agendamento. Por favor, poderia tentar confirmar novamente?" 
                    };
                    return [...newMessages, errorMessage];
                });
                
                setActionOptions([
                    { label: 'Confirmar Agendamento', value: 'confirm' },
                    { label: 'Corrigir Informações', value: 'correct' },
                ]);
                setIsActionPending(true);
            } finally {
                setIsTyping(false);
            }
    
        } else if (value === 'correct') {
            setIsCorrecting(true);
            const correctionOptions = Object.keys(leadData)
                .filter((key): key is LeadDataKey => key in CORRECTION_FIELD_LABELS && leadData[key as LeadDataKey] !== undefined)
                .map(key => ({ label: CORRECTION_FIELD_LABELS[key], value: key }));
    
            setActionOptions(correctionOptions);
        } else if (isCorrecting) {
            if (value in CORRECTION_FIELD_LABELS) {
                handleCorrection(value as LeadDataKey);
            } else {
                handleSendMessage(label || value);
            }
        } else {
            handleSendMessage(label || value);
        }
    }, [config, chatService, leadData, messages, isCorrecting, handleCorrection, handleSendMessage]);

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
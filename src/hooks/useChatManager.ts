import { useState, useEffect, useCallback } from 'react';
import { Message, MessageSender, LeadData, LeadDataKey, ChatConfig } from '../types';
import { getAiResponse, sendLeadToCRM, getFallbackResponse, getFallbackSummary, getFinalSummary } from '../services/geminiService';
import { calculateFullDate, parseHumanNumber } from '../utils/helpers';


export const useChatManager = (config: ChatConfig | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [leadData, setLeadData] = useState<Partial<LeadData>>({});
    const [isTyping, setIsTyping] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [isDone, setIsDone] = useState<boolean>(false);
    const [actionOptions, setActionOptions] = useState<{ label: string; value: string; }[]>([]);
    const [isActionPending, setIsActionPending] = useState<boolean>(false);
    const [nextKey, setNextKey] = useState<LeadDataKey | null>(null);
    const [isCorrecting, setIsCorrecting] = useState<boolean>(false);
    const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);

    useEffect(() => {
        if (!config) return;

        const urlParams = new URLSearchParams(window.location.search);
        const sourceParam = urlParams.get('origem') || urlParams.get('source') || urlParams.get('utm_source');
        const initialData: Partial<LeadData> = { source: sourceParam || 'Direto' };
        setLeadData(initialData);

        const fetchWelcomeMessage = async () => {
            setIsTyping(true);
            const initialHistory: Message[] = [];
            try {
                const { responseText, nextKey: newNextKeyFromAI } = await getAiResponse(initialHistory, initialData, config);
                setMessages([{ id: Date.now(), sender: MessageSender.Bot, text: responseText }]);
                setNextKey(newNextKeyFromAI);
            } catch (error) {
                console.error("Initial API call failed, starting in fallback mode.", error);
                setIsFallbackMode(true);
                const fallbackNotice: Message = { id: Date.now(), sender: MessageSender.Bot, text: "Olá! Parece que estamos com instabilidade na conexão com nossa IA. Vamos continuar em um modo mais direto para garantir seu atendimento."};
                const { responseText, nextKey } = getFallbackResponse("", initialData, null, config);
                const firstQuestion: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: responseText };
                setMessages([fallbackNotice, firstQuestion]);
                setNextKey(nextKey);
            }
            setIsTyping(false);
        };
        fetchWelcomeMessage();
    }, [config]);


    const showSummaryAndActions = useCallback(async (data: Partial<LeadData>) => {
        if (!config) return;

        setIsTyping(true);
        
        const dateTimeString = data.start_datetime || '';
        const dayMatch = dateTimeString.match(/(\b(domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado)\b)/i);
        const timeMatch = dateTimeString.match(/(\d{1,2}[:h]?\d{0,2})/);
        const dayOfWeek = dayMatch ? dayMatch[1] : '';
        const time = timeMatch ? timeMatch[0] : '';
        const finalDate = calculateFullDate(dayOfWeek, time);
        
        const finalLeadData = { ...data, start_datetime: finalDate };
        setLeadData(finalLeadData);
        
        const summaryText = isFallbackMode ? getFallbackSummary(finalLeadData) : await getFinalSummary(finalLeadData, config);
        setLeadData(prev => ({ ...prev, final_summary: summaryText }));

        const summaryMessage: Message = { id: Date.now() + 2, sender: MessageSender.Bot, text: summaryText };
        setMessages(prev => [...prev, summaryMessage]);

        setActionOptions([
            { label: 'Confirmar Agendamento', value: 'confirm' },
            { label: 'Corrigir Informações', value: 'correct' },
        ]);
        setIsActionPending(true);
        setIsTyping(false);
    }, [config, isFallbackMode]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (isSending || isDone || !config) return;

        const userMessage: Message = { id: Date.now(), sender: MessageSender.User, text };
        const currentHistory = [...messages, userMessage];
        setMessages(currentHistory);
        setIsSending(true);
        setIsTyping(true);
        setActionOptions([]);
        setIsActionPending(false);

        if (nextKey === 'client_whatsapp') {
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

        if (nextKey === 'client_email') {
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
            if (isFallbackMode) {
                 response = getFallbackResponse(text, leadData, nextKey, config);
            } else {
                 response = await getAiResponse(currentHistory, leadData, config);
            }
            
            const { updatedLeadData, responseText, action, nextKey: newNextKeyFromAI } = response;
            
            if (nextKey === 'valor_credito') {
                let creditValue = updatedLeadData.valor_credito ? Number(updatedLeadData.valor_credito) : NaN;
        
                if (creditValue < 15000) {
                    const reParsedValue = parseHumanNumber(text, true);
                    if (!isNaN(reParsedValue) && reParsedValue >= 15000) {
                        creditValue = reParsedValue;
                        updatedLeadData.valor_credito = creditValue;
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

            const fallbackNotice: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: "Desculpe, estou com instabilidade na conexão. Para não te deixar sem resposta, vamos continuar de forma mais direta, ok?" };
            setMessages(prev => [...prev, fallbackNotice]);

            const { responseText, nextKey: fallbackNextKey } = getFallbackResponse(text, leadData, nextKey, config);
            const fallbackQuestion: Message = { id: Date.now() + 2, sender: MessageSender.Bot, text: responseText };
            setMessages(prev => [...prev, fallbackQuestion]);
            setNextKey(fallbackNextKey);
            setIsTyping(false);
        } finally {
            setIsSending(false);
        }
    }, [config, isSending, isDone, messages, leadData, nextKey, isFallbackMode, isCorrecting, showSummaryAndActions]);
    
    const handleCorrection = useCallback(async (keyToCorrect: LeadDataKey) => {
        if (!config) return;

        setActionOptions([]);
        setIsActionPending(false);

        const newLeadData = { ...leadData };
        delete newLeadData[keyToCorrect];
        if (keyToCorrect === 'start_datetime') delete newLeadData.final_summary;
        setLeadData(newLeadData);

        setNextKey(keyToCorrect);
        setIsTyping(true);

        const { responseText, nextKey: newNextKey, action } = getFallbackResponse("", newLeadData, keyToCorrect, config);
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
    }, [config, leadData]);


    const handlePillSelect = useCallback(async (value: string, label?: string) => {
        if (!config) return;
    
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
                await sendLeadToCRM(leadData, currentMessages, config);
                
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
            setIsFallbackMode(true);
            setIsCorrecting(true);
            const fieldLabels: Record<string, string> = {
                client_name: 'Nome', topic: 'Objetivo', valor_credito: 'Valor do Crédito',
                reserva_mensal: 'Reserva Mensal', client_whatsapp: 'WhatsApp', client_email: 'E-mail',
                meeting_type: 'Tipo de Reunião', start_datetime: 'Data/Hora'
            };
            const correctionOptions = Object.keys(leadData)
                .filter((key): key is LeadDataKey => key in fieldLabels && leadData[key as LeadDataKey] !== undefined && key !== 'source' && key !== 'final_summary')
                .map(key => ({ label: fieldLabels[key], value: key }));
    
            setActionOptions(correctionOptions);
        } else if (isCorrecting) {
            handleCorrection(value as LeadDataKey);
        } else {
            handleSendMessage(label || value);
        }
    }, [config, leadData, messages, isCorrecting, handleCorrection, handleSendMessage]);

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
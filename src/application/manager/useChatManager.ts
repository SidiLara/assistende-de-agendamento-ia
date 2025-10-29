import { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, MessageSender } from '../../model/mensagem/MensagemModel';
import { LeadData, LeadDataKey } from '../../model/lead/LeadModel';
import { ChatConfig } from '../../model/configuracao/ConfiguracaoChatModel';
import { calculateFullDate } from '../../core/formatters/DateAndTime';
import { parseHumanNumber } from '../../core/formatters/Number';
import { FallbackRule } from '../rule/FallbackRule';
import { createSystemPrompt, leadDataSchema, createFinalSummaryPrompt, createInternalSummaryPrompt } from '../../infrastructure/prompt/ChatPrompts';
import { AiResponse } from '../../dto/response/chat/ChatResponse';

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

const BASE_MAKE_URL = "https://hook.us2.make.com/";

// --- Gemini API Functions (formerly in ChatServiceImpl) ---

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callApiWithRetry = async <T>(apiFn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await apiFn();
        } catch (error: any) {
            lastError = error;
            const errorMessage = error.toString().toLowerCase();
            if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('unavailable') || errorMessage.includes('rate limit')) {
                 if (i < retries - 1) {
                    const waitTime = delay * Math.pow(2, i);
                    console.warn(`API call failed due to transient error, retrying in ${waitTime}ms...`);
                    await sleep(waitTime);
                }
            } else {
                throw lastError;
            }
        }
    }
    throw lastError;
};

const callGenerativeApi = async (apiCall: (ai: GoogleGenAI) => Promise<any>) => {
    try {
        const ai = getAiClient();
        return await callApiWithRetry(() => apiCall(ai));
    } catch (error) {
        console.error("API call failed after retries.", error);
        throw new Error("API call failed, switching to local script.");
    }
};

const getAiResponse = async (history: Message[], currentData: Partial<LeadData>, config: ChatConfig): Promise<AiResponse> => {
    const contextMessage = `[CONTEXTO] Dados já coletados: ${JSON.stringify(currentData)}. Analise o histórico e o contexto para determinar a próxima pergunta.`;
    
    const contents: {role: 'user' | 'model', parts: {text: string}[]}[] = [{
        role: 'user',
        parts: [{ text: contextMessage }]
    }];

    for (const msg of history) {
        contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    }
    
    const systemInstruction = createSystemPrompt(config.assistantName, config.consultantName);

    const response = await callGenerativeApi(ai => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: leadDataSchema
        }
    }));

    const jsonText = response.text;
    try {
        const parsedJson = JSON.parse(jsonText);
        const { responseText, action, nextKey, ...updatedLeadData } = parsedJson;
        
        const formattedText = (responseText || "Desculpe, não entendi. Pode repetir?")
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        return {
            updatedLeadData,
            responseText: formattedText,
            action: action || null,
            nextKey: nextKey || null
        };
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", jsonText, e);
        throw new Error("JSON parsing failed");
    }
};

const getFinalSummary = async (leadData: Partial<LeadData>, config: ChatConfig): Promise<string> => {
    const summaryPrompt = createFinalSummaryPrompt(leadData, config);

    const response = await callGenerativeApi(ai => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: summaryPrompt,
    }));

    return response.text.trim();
};

const getInternalSummaryForCRM = async (leadData: Partial<LeadData>, history: Message[], formattedCreditAmount: string, formattedMonthlyInvestment: string, consultantName: string): Promise<string> => {
    const internalSummaryPrompt = createInternalSummaryPrompt(leadData, history, formattedCreditAmount, formattedMonthlyInvestment, consultantName);
    
    try {
        const response = await callGenerativeApi(ai => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: internalSummaryPrompt,
        }));
        return response.text.trim();
    } catch (error) {
        console.error("Failed to generate internal CRM summary:", error);
        return "Não foi possível gerar o relatório narrativo da conversa.";
    }
};

const sendLeadToCRM = async (leadData: Partial<LeadData>, history: Message[], config: ChatConfig) => {
    const { webhookId, consultantName } = config;
    const MAKE_URL = `${BASE_MAKE_URL}${webhookId}`;
    
    let leadCounter = 1;
    try {
        const storedCounter = localStorage.getItem('leadCounter');
        if (storedCounter) {
            leadCounter = parseInt(storedCounter, 10);
        }
    } catch (e) {
        console.error("Could not access localStorage for lead counter", e);
    }
    const currentLeadNumber = leadCounter;
    try {
        localStorage.setItem('leadCounter', (leadCounter + 1).toString());
    } catch (e) {
        console.error("Could not update localStorage for lead counter", e);
    }

    const { clientName, clientWhatsapp, clientEmail, topic, creditAmount = 0, monthlyInvestment = 0, startDatetime, source, finalSummary, meetingType } = leadData;

    const formattedCreditAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creditAmount);
    const formattedMonthlyInvestment = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyInvestment);

    const narrativeReport = await getInternalSummaryForCRM(leadData, history, formattedCreditAmount, formattedMonthlyInvestment, consultantName);

    let notesContent = `Lead: ${currentLeadNumber}\n\n`;
    notesContent += "RELATÓRIO DA CONVERSA (IA):\n";
    notesContent += `${narrativeReport}\n\n`;
    notesContent += "--------------------------------------\n\n";
    notesContent += "DADOS CAPTURADOS:\n";
    notesContent += `Origem: ${source || 'Direto'}\n`;
    notesContent += `Nome do Cliente: ${clientName}\n`;
    notesContent += `WhatsApp: ${clientWhatsapp || 'Não informado'}\n`;
    notesContent += `E-mail: ${clientEmail || 'Não informado'}\n`;
    notesContent += `Objetivo do Projeto: ${topic}\n`;
    notesContent += `Valor do Crédito: ${formattedCreditAmount}\n`;
    notesContent += `Reserva Mensal: ${formattedMonthlyInvestment}\n`;
    notesContent += `Agendamento Preferencial: ${startDatetime || 'Não informado'}\n\n`;
    
    if (startDatetime) {
        const timeMatch = startDatetime.match(/\b(\d{1,2}):(\d{2})\b/);
        if (timeMatch) {
            const hour = parseInt(timeMatch[1], 10);
            if (hour < 6 || hour >= 22) {
                notesContent += "ATENÇÃO: Horário de agendamento fora do padrão comercial. Recomenda-se ligar para confirmar.\n";
            }
        }
    }

    const requestBody = {
        nome: clientName,
        email: clientEmail || 'nao-informado@lead.com',
        celular: (clientWhatsapp || '').replace(/\D/g, ''),
        cpf_ou_cnpj: "000.000.000-00",
        classificacao1: `Projeto: ${topic}`,
        classificacao2: `${formattedCreditAmount}`,
        classificacao3: `Reserva Mensal: ${formattedMonthlyInvestment}`,
        obs: notesContent,
        platform: "GEMSID",
        consultantName,
        final_summary: finalSummary,
        start_datetime: startDatetime,
        meeting_type: meetingType,
    };

    try {
        const response = await fetch(MAKE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        console.log("Lead enviado para o CRM:", requestBody);
        if (!response.ok) {
            console.error("Erro na resposta do CRM:", response.status, response.statusText);
            const responseBody = await response.text();
            console.error("Corpo da resposta do CRM:", responseBody);
            throw new Error(`CRM submission failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao enviar para o CRM:", error);
        throw error;
    }
};

export const useChatManager = (config: ChatConfig | null, fallbackRule: FallbackRule | null) => {
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
    const [hasShownSummary, setHasShownSummary] = useState<boolean>(false);

    useEffect(() => {
        if (!config || !fallbackRule) return;

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
                const fallbackNotice: Message = { 
                    id: Date.now(), 
                    sender: MessageSender.Bot, 
                    text: "Estamos com instabilidade na conexão com a IA. Para garantir seu atendimento, vamos continuar em um modo mais direto.",
                    isNotice: true,
                };
                const { responseText, nextKey } = fallbackRule.getFallbackResponse("", initialData, null, config);
                const firstQuestion: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: responseText };
                setMessages([fallbackNotice, firstQuestion]);
                setNextKey(nextKey);
            }
            setIsTyping(false);
        };
        fetchWelcomeMessage();
    }, [config, fallbackRule]);


    const showSummaryAndActions = useCallback(async (data: Partial<LeadData>) => {
        if (!config || !fallbackRule) return;

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
            ? fallbackRule.getFallbackSummary(finalLeadData) 
            : await getFinalSummary(finalLeadData, config);
            
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
    }, [config, fallbackRule, isFallbackMode, hasShownSummary]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (isSending || isDone || !config || !fallbackRule) return;

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
                 response = fallbackRule.getFallbackResponse(text, leadData, nextKey, config);
            } else {
                 response = await getAiResponse(currentHistory, leadData, config);
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

            const { responseText, nextKey: fallbackNextKey } = fallbackRule.getFallbackResponse(text, leadData, nextKey, config);
            const fallbackQuestion: Message = { id: Date.now() + 2, sender: MessageSender.Bot, text: responseText };
            setMessages(prev => [...prev, fallbackQuestion]);
            setNextKey(fallbackNextKey);
            setIsTyping(false);
        } finally {
            setIsSending(false);
        }
    }, [config, fallbackRule, isSending, isDone, messages, leadData, nextKey, isFallbackMode, isCorrecting, showSummaryAndActions, hasShownSummary]);
    
    const handleCorrection = useCallback(async (keyToCorrect: LeadDataKey) => {
        if (!config || !fallbackRule) return;

        setActionOptions([]);
        setIsActionPending(false);

        const newLeadData = { ...leadData };
        delete newLeadData[keyToCorrect];
        if (keyToCorrect === 'startDatetime') delete newLeadData.finalSummary;
        setLeadData(newLeadData);

        setNextKey(keyToCorrect);
        setIsTyping(true);

        const { responseText, nextKey: newNextKey, action } = fallbackRule.getFallbackResponse("", newLeadData, keyToCorrect, config);
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
    }, [config, fallbackRule, leadData]);


    const handlePillSelect = useCallback(async (value: string, label?: string) => {
        if (!config || !fallbackRule) return;
    
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
    }, [config, fallbackRule, leadData, messages, isCorrecting, handleCorrection, handleSendMessage]);

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
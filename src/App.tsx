import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { ChatBody } from './components/ChatBody';
import { ChatInput } from './components/ChatInput';
import { ActionPills } from './components/ActionPills';
import { Message, MessageSender, LeadData, LeadDataKey } from './types';
import { getAiResponse, getFinalSummary, sendLeadToCRM, getFallbackResponse, getFallbackSummary } from './services/geminiService';

const calculateFullDate = (dayOfWeek: string, time: string): string => {
    const now = new Date();
    const weekDays: { [key: string]: number } = {
        "domingo": 0, "segunda-feira": 1, "terça-feira": 2, "quarta-feira": 3, 
        "quinta-feira": 4, "sexta-feira": 5, "sábado": 6
    };
    const targetDay = weekDays[dayOfWeek.toLowerCase()];
    
    const timeMatch = time.match(/(\d{1,2}):?(\d{2})?/);
    if (!timeMatch) return `${dayOfWeek} às ${time}`;

    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2] || '0', 10);

    const resultDate = new Date();
    resultDate.setHours(hour, minute, 0, 0);

    let dayDiff = targetDay - now.getDay();
    if (dayDiff < 0) {
        dayDiff += 7;
    } else if (dayDiff === 0 && resultDate.getTime() < now.getTime()) {
        dayDiff += 7;
    }
    
    resultDate.setDate(now.getDate() + dayDiff);

    return resultDate.toLocaleString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const App: React.FC = () => {
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

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchWelcomeMessage = async () => {
            setIsTyping(true);
            const initialHistory: Message[] = [];
            const initialData: Partial<LeadData> = {};
            try {
                const { responseText, nextKey: newNextKeyFromAI } = await getAiResponse(initialHistory, initialData);
                setMessages([{ id: Date.now(), sender: MessageSender.Bot, text: responseText }]);
                setNextKey(newNextKeyFromAI);
            } catch (error) {
                console.error("Initial API call failed, starting in fallback mode.", error);
                setIsFallbackMode(true);
                const fallbackNotice: Message = { id: Date.now(), sender: MessageSender.Bot, text: "Olá! Parece que estamos com instabilidade na conexão com nossa IA. Vamos continuar em um modo mais direto para garantir seu atendimento."};
                const { responseText, nextKey } = getFallbackResponse("", {}, null);
                const firstQuestion: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: responseText };
                setMessages([fallbackNotice, firstQuestion]);
                setNextKey(nextKey);
            }
            setIsTyping(false);
        };
        fetchWelcomeMessage();
    }, []);

    useEffect(() => {
        if (!isTyping && !isActionPending && !isDone) {
            inputRef.current?.focus();
        }
    }, [isTyping, isActionPending, isDone]);


    const handleSendMessage = async (text: string) => {
        if (isSending || isDone) return;

        const userMessage: Message = { id: Date.now(), sender: MessageSender.User, text };
        const currentHistory = [...messages, userMessage];
        setMessages(currentHistory);
        setIsSending(true);
        setIsTyping(true);
        setActionOptions([]);
        setIsActionPending(false);

        if (nextKey === 'client_whatsapp') {
            const justDigits = text.replace(/\D/g, '');
            if (justDigits.length !== 11 || justDigits[2] !== '9') {
                const errorMessage: Message = {
                    id: Date.now() + 1,
                    sender: MessageSender.Bot,
                    text: "Hmm, não consegui identificar um número de WhatsApp válido em sua mensagem. Por favor, insira o número com DDD no formato <strong>(XX) 9XXXX-XXXX</strong>."
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
                 response = getFallbackResponse(text, leadData, nextKey);
            } else {
                 response = await getAiResponse(currentHistory, leadData);
            }
            
            const { updatedLeadData, responseText, action, nextKey: newNextKeyFromAI } = response;
            
            if (nextKey === 'valor_credito' && updatedLeadData.hasOwnProperty('valor_credito')) {
                const creditValue = Number(String(updatedLeadData.valor_credito).replace(/[^0-9,.-]/g, '').replace('.', '').replace(',', '.'));
                if (isNaN(creditValue) || creditValue <= 0) {
                    const errorMessage: Message = {
                        id: Date.now() + 1,
                        sender: MessageSender.Bot,
                        text: "Ops, parece que o valor não é válido. Por favor, insira um valor de crédito positivo. Qual o <strong>valor do crédito</strong> que você tem em mente?"
                    };
                    setMessages(prev => [...prev, errorMessage]);
                    setIsTyping(false);
                    setIsSending(false);
                    return;
                }
                 updatedLeadData.valor_credito = creditValue;
            }
            
            const newLeadData = { ...leadData, ...updatedLeadData };
            setLeadData(newLeadData);
            setNextKey(newNextKeyFromAI);

            if (responseText) {
                const botMessage: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: responseText };
                setMessages(prev => [...prev, botMessage]);
            }

            if (newNextKeyFromAI === null && !isCorrecting) {
                setIsTyping(true);
                
                const finalDate = calculateFullDate(
                    (newLeadData.start_datetime?.split(' ')[0] || ''),
                    (newLeadData.start_datetime?.split(' ')[2] || '')
                );
                
                const finalLeadData = { ...newLeadData, start_datetime: finalDate };
                setLeadData(finalLeadData);
                
                setIsFallbackMode(true);

                const summaryText = isFallbackMode ? getFallbackSummary(finalLeadData) : await getFinalSummary(finalLeadData);
                setLeadData(prev => ({ ...prev, final_summary: summaryText }));

                const summaryMessage: Message = { id: Date.now() + 2, sender: MessageSender.Bot, text: summaryText };
                setMessages(prev => [...prev, summaryMessage]);

                setActionOptions([
                    { label: 'Confirmar Agendamento', value: 'confirm' },
                    { label: 'Corrigir Informações', value: 'correct' },
                ]);
                setIsActionPending(true);
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
            }
            setIsCorrecting(false); 
        } catch (error) {
            console.error("API Error, switching to fallback mode:", error);
            setIsFallbackMode(true);

            const fallbackNotice: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: "Desculpe, estou com instabilidade na conexão. Para não te deixar sem resposta, vamos continuar de forma mais direta, ok?" };
            setMessages(prev => [...prev, fallbackNotice]);

            const { responseText, nextKey: fallbackNextKey } = getFallbackResponse(text, leadData, nextKey);
            const fallbackQuestion: Message = { id: Date.now() + 2, sender: MessageSender.Bot, text: responseText };
            setMessages(prev => [...prev, fallbackQuestion]);
            setNextKey(fallbackNextKey);
        } finally {
            setIsTyping(false);
            setIsSending(false);
        }
    };
    
    const handleCorrection = async (keyToCorrect: LeadDataKey) => {
        setIsCorrecting(false);
        setActionOptions([]);
        setIsActionPending(false);

        const newLeadData = { ...leadData };
        delete newLeadData[keyToCorrect];
        if (keyToCorrect === 'start_datetime') delete newLeadData.final_summary;
        setLeadData(newLeadData);

        setNextKey(keyToCorrect);
        setIsTyping(true);

        if (isFallbackMode) {
             const { responseText, nextKey: newNextKey, action } = getFallbackResponse("", newLeadData, keyToCorrect);
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
        } else {
            const correctionHistory = [...messages, { id: Date.now(), sender: MessageSender.User, text: `Quero corrigir ${keyToCorrect}` }];
            const { responseText, action, nextKey: newNextKeyFromAI } = await getAiResponse(correctionHistory, newLeadData);

            if (responseText) {
                const botMessage: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: responseText };
                setMessages(prev => [...prev, botMessage]);
            }
            
            setNextKey(newNextKeyFromAI);

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
        }

        setIsTyping(false);
    };


    const handlePillSelect = async (value: string, label?: string) => {
        if (value === 'confirm') {
            setActionOptions([]);
            setIsActionPending(false);
            setIsTyping(true);
            await sendLeadToCRM(leadData as LeadData);
            const finalMessage: Message = { id: Date.now(), sender: MessageSender.Bot, text: "Perfeito! Seu agendamento foi confirmado. Sidinei Lara entrará em contato com você em breve. Obrigado!" };
            setMessages(prev => [...prev, finalMessage]);
            setIsDone(true);
            setIsTyping(false);
        } else if (value === 'correct') {
            const fieldLabels: Record<string, string> = {
                client_name: 'Nome', topic: 'Objetivo', valor_credito: 'Valor do Crédito',
                reserva_mensal: 'Reserva Mensal', client_whatsapp: 'WhatsApp', client_email: 'E-mail',
                meeting_type: 'Tipo de Reunião', start_datetime: 'Data/Hora'
            };
            const correctionOptions = Object.keys(leadData)
                .filter((key): key is LeadDataKey => key in fieldLabels && leadData[key as LeadDataKey] !== undefined)
                .map(key => ({ label: fieldLabels[key], value: key }));

            setActionOptions(correctionOptions);
            setIsCorrecting(true);
        } else if (isCorrecting) {
            handleCorrection(value as LeadDataKey);
        } else {
            handleSendMessage(label || value);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans">
            <div className="flex-1 min-h-0 flex justify-center items-center p-4">
                <div className="w-full max-w-xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
                    <ChatHeader />
                    <ChatBody messages={messages} isTyping={isTyping} />
                    <div className="p-5 border-t border-gray-200 bg-white rounded-b-2xl">
                        {isActionPending && <ActionPills options={actionOptions} onSelect={handlePillSelect} />}
                        <ChatInput ref={inputRef} onSendMessage={handleSendMessage} isSending={isSending} isDone={isDone} isActionPending={isActionPending} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
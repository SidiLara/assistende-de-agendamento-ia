import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { ChatBody } from './components/ChatBody';
import { ChatInput } from './components/ChatInput';
import { ActionPills } from './components/ActionPills';
import { Message, MessageSender, LeadData, LeadDataKey, ChatConfig } from './types';
import { getAiResponse, sendLeadToCRM, getFallbackResponse, getFallbackSummary, getFinalSummary } from './services/geminiService';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const calculateFullDate = (dayOfWeek: string, time: string): string => {
    const now = new Date();
    
    // More robust day matching
    const weekDayMap: { [key: string]: number } = {
        domingo: 0, segunda: 1, terca: 2, terça: 2, quarta: 3, 
        quinta: 4, sexta: 5, sabado: 6, sábado: 6
    };
    const normalizedDayInput = dayOfWeek.toLowerCase().replace('-feira', '');
    const targetDayKey = Object.keys(weekDayMap).find(key => normalizedDayInput.includes(key));
    const targetDay = targetDayKey !== undefined ? weekDayMap[targetDayKey] : -1;

    // More robust time parsing
    const timeInput = time.toLowerCase();
    const timeMatch = timeInput.match(/(\d{1,2})[:h]?(\d{2})?/);

    if (targetDay === -1 || !timeMatch) {
        return `${dayOfWeek} ${time}`.trim();
    }

    const hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;

    if (isNaN(hour) || isNaN(minute) || hour > 23 || minute > 59) {
         return `${dayOfWeek} ${time}`.trim();
    }

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

const parseHumanNumber = (text: string, assumeThousandsForSmallNumbers = false): number => {
    let normalizedText = text.toLowerCase().trim().replace(/r\$|\./g, '').replace(',', '.');
    let multiplier = 1;
    if (normalizedText.includes('k') || normalizedText.includes('mil')) {
        multiplier = 1000;
        normalizedText = normalizedText.replace(/k|mil/g, '').trim();
    }
    const numericMatch = normalizedText.match(/[+-]?([0-9]*[.])?[0-9]+/);
    if (!numericMatch) return NaN;
    let value = parseFloat(numericMatch[0]);
    if (isNaN(value)) return NaN;
    value *= multiplier;
    if (assumeThousandsForSmallNumbers && multiplier === 1 && value >= 15 && value < 1000) {
        value *= 1000;
    }
    return value;
};


const App: React.FC = () => {
    const [config, setConfig] = useState<ChatConfig | null>(null);
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
        const urlParams = new URLSearchParams(window.location.search);
        
        const appConfig: ChatConfig = {
            consultantName: urlParams.get('consultor') || 'Sidinei Lara',
            assistantName: urlParams.get('assistente') || 'Yannis',
            consultantPhoto: urlParams.get('foto') || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=128&h=128&fit=crop&crop=faces',
            webhookId: urlParams.get('webhook') || 'ud4aq9lrms2mfpce40ur6ac1papv68fi',
        }
        setConfig(appConfig);

        // Pixel implementation
        const pixelId = urlParams.get('pixelId');
        if (pixelId && !window.fbq) {
            const fbPixelScript = document.createElement('script');
            fbPixelScript.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(fbPixelScript);
            const noScript = document.createElement('noscript');
            noScript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
            document.head.appendChild(noScript);
        }

        const sourceParam = urlParams.get('origem') || urlParams.get('source') || urlParams.get('utm_source');
        const initialData: Partial<LeadData> = { source: sourceParam || 'Direto' };
        setLeadData(initialData);

        const fetchWelcomeMessage = async () => {
            setIsTyping(true);
            const initialHistory: Message[] = [];
            try {
                const { responseText, nextKey: newNextKeyFromAI } = await getAiResponse(initialHistory, initialData, appConfig);
                setMessages([{ id: Date.now(), sender: MessageSender.Bot, text: responseText }]);
                setNextKey(newNextKeyFromAI);
            } catch (error) {
                console.error("Initial API call failed, starting in fallback mode.", error);
                setIsFallbackMode(true);
                const fallbackNotice: Message = { id: Date.now(), sender: MessageSender.Bot, text: "Olá! Parece que estamos com instabilidade na conexão com nossa IA. Vamos continuar em um modo mais direto para garantir seu atendimento."};
                const { responseText, nextKey } = getFallbackResponse("", initialData, null, appConfig);
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
            setNextKey(newNextKeyFromAI);

            if (responseText) {
                const botMessage: Message = { id: Date.now() + 1, sender: MessageSender.Bot, text: responseText };
                setMessages(prev => [...prev, botMessage]);
            }

            const allDataCollected = newNextKeyFromAI === null && !isCorrecting;

            if (allDataCollected) {
                setIsTyping(true);
                
                const dateTimeString = newLeadData.start_datetime || '';
                const dayMatch = dateTimeString.match(/(\b(domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado)\b)/i);
                const timeMatch = dateTimeString.match(/(\d{1,2}[:h]?\d{0,2})/);
                const dayOfWeek = dayMatch ? dayMatch[1] : '';
                const time = timeMatch ? timeMatch[0] : '';
                const finalDate = calculateFullDate(dayOfWeek, time);
                
                const finalLeadData = { ...newLeadData, start_datetime: finalDate };
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
             if (isCorrecting && newNextKeyFromAI === null) {
                setIsCorrecting(false); 
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
        } finally {
            setIsTyping(false);
            setIsSending(false);
        }
    };
    
    const handleCorrection = async (keyToCorrect: LeadDataKey) => {
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
    };


    const handlePillSelect = async (value: string, label?: string) => {
        if (!config) return;
        if (value === 'confirm') {
            setActionOptions([]);
            setIsActionPending(false);
            setIsTyping(true);
            await sendLeadToCRM(leadData as LeadData, messages, config);
            
            if (window.fbq) {
                window.fbq('track', 'Lead');
            }
            
            const finalMessage: Message = { id: Date.now(), sender: MessageSender.Bot, text: `Perfeito! Seu agendamento foi confirmado. ${config.consultantName} entrará em contato com você em breve. Obrigado!` };
            setMessages(prev => [...prev, finalMessage]);
            setIsDone(true);
            setIsTyping(false);
        } else if (value === 'correct') {
            setIsFallbackMode(true);
            setIsCorrecting(true); // Set correcting mode
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
    };

    if (!config) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-green"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen font-sans bg-white/70 backdrop-blur-sm">
            <div className="flex-1 min-h-0 flex justify-center items-center p-4">
                <div className="w-full max-w-xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
                    <ChatHeader 
                        consultantName={config.consultantName}
                        consultantPhoto={config.consultantPhoto}
                    />
                    <ChatBody messages={messages} isTyping={isTyping} />
                    <div className="p-5 border-t border-gray-200 bg-white rounded-b-2xl">
                        {isActionPending && <ActionPills options={actionOptions} onSelect={handlePillSelect} />}
                        <ChatInput ref={inputRef} onSendMessage={handleSendMessage} isSending={isSending} isDone={isDone} isActionPending={isActionPending} nextKey={nextKey} />
                    </div>
                </div>
            </div>
             <footer className="text-center text-xs text-gray-600 p-4">
                Powered by GEMSID | Direitos reservados para {config.consultantName}
            </footer>
        </div>
    );
};

export default App;
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Mensagem } from '../servicos/chat/modelos/MensagemModel';
import { Lead } from '../servicos/chat/modelos/LeadModel';
import { ConfiguracaoChat } from '../servicos/chat/modelos/ConfiguracaoChatModel';
import { RespostaAi } from '../servicos/chat/modelos/RespostaAi';
import { ServicoDeChat, OpcaoDeAcao } from '../servicos/chat/InterfacesChat';

export const useGerenciadorDeChat = (config: ConfiguracaoChat, chatService: ServicoDeChat) => {
    const [messages, setMessages] = useState<Mensagem[]>([]);
    const [lead, setLead] = useState<Lead>({});
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [actionOptions, setActionOptions] = useState<OpcaoDeAcao[]>([]);
    const [isActionPending, setIsActionPending] = useState(false);
    const [nextKey, setNextKey] = useState<keyof Lead | null>(null);

    const addMessage = useCallback((text: string, sender: 'usuario' | 'assistente', delay = 500) => {
        const newMessage: Mensagem = { id: uuidv4(), text, sender, timestamp: Date.now(), delay };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, []);

    const processAIResponse = useCallback(async (response: RespostaAi) => {
        if (response.tipo === 'json' && response.lead) {
            setLead(prev => ({ ...prev, ...response.lead }));
            // Recursive call to get the next action from the AI
            const newHistory = [...messages, addMessage('Atualizando dados...', 'assistente')];
            const nextAction = await chatService.analisarMensagem(config, { ...lead, ...response.lead }, newHistory);
            processAIResponse(nextAction);
        } else {
            addMessage(response.texto, 'assistente');
        }

        if (response.tipo === 'despedida') {
            setIsDone(true);
            await chatService.enviarLead(lead, config);
        }
    }, [addMessage, chatService, config, lead, messages]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (isSending || isDone) return;

        setIsSending(true);
        const userMessage = addMessage(text, 'usuario');
        const currentHistory = [...messages, userMessage];

        try {
            setIsTyping(true);
            const aiResponse = await chatService.analisarMensagem(config, lead, currentHistory);
            setIsTyping(false);
            processAIResponse(aiResponse);
        } catch (error) {
            console.error("Falha ao processar mensagem:", error);
            addMessage("Desculpe, não estou me sentindo bem. Poderia tentar novamente mais tarde?", 'assistente');
        } finally {
            setIsSending(false);
        }
    }, [isSending, isDone, addMessage, messages, chatService, config, lead, processAIResponse]);

    const handlePillSelect = useCallback((value: string, key: string) => {
        handleSendMessage(value);
        setActionOptions([]);
        setIsActionPending(false);
        setNextKey(null);
    }, [handleSendMessage]);


    useEffect(() => {
        // Start the conversation
        const startConversation = async () => {
            setIsTyping(true);
            const initialResponse = await chatService.analisarMensagem(config, lead, []);
            setIsTyping(false);
            processAIResponse(initialResponse);
        };
        startConversation();
    }, [chatService, config]); // Removed dependencies to run only once


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

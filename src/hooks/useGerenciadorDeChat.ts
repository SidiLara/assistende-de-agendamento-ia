import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Mensagem } from '../services/chat/modelos/MensagemModel';
import { Lead } from '../services/chat/modelos/LeadModel';
import { ConfiguracaoChat } from '../services/chat/modelos/ConfiguracaoChatModel';
import { RespostaAi } from '../services/chat/modelos/RespostaAi';
import { ServicoDeChat, OpcaoDeAcao } from '../services/chat/InterfacesChat';

export const useGerenciadorDeChat = (config: ConfiguracaoChat, chatService: ServicoDeChat) => {
    const [messages, setMessages] = useState<Mensagem[]>([]);
    const [lead, setLead] = useState<Lead>({});
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [actionOptions, setActionOptions] = useState<OpcaoDeAcao[]>([]);

    const addMessage = useCallback((texto: string, remetente: 'usuario' | 'assistente') => {
        const newMessage: Mensagem = { id: uuidv4(), texto, remetente, timestamp: Date.now() };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, []);

    const processAIResponse = useCallback(async (response: RespostaAi) => {
        addMessage(response.texto, 'assistente');

        if (response.tipo === 'json' && response.lead) {
            setLead(prev => ({ ...prev, ...response.lead }));
            
            if(response.opcoes) {
                setActionOptions(response.opcoes);
            }
        } else if (response.tipo === 'despedida') {
            setIsDone(true);
            await chatService.enviarLead(lead, config);
        }
    }, [addMessage, chatService, config, lead]);

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
    }, []); // Removed dependencies to run only once


    return {
        messages,
        isTyping,
        isSending,
        isDone,
        actionOptions,
        handleSendMessage,
        handlePillSelect,
    };
};
import { createContext, useContext } from 'react';
import { ChatService } from '../application/service/ChatService';

export const ChatServiceContext = createContext<ChatService | null>(null);

export const useChatService = (): ChatService => {
    const context = useContext(ChatServiceContext);
    if (!context) {
        throw new Error('useChatService must be used within a ChatServiceProvider');
    }
    return context;
};
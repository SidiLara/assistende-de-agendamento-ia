import * as React from 'react';
import { ChatService } from '../application/service/ChatService';

export const ChatServiceContext = React.createContext<ChatService | null>(null);

export const useChatService = (): ChatService => {
    const context = React.useContext(ChatServiceContext);
    if (!context) {
        throw new Error('useChatService must be used within a ChatServiceProvider');
    }
    return context;
};
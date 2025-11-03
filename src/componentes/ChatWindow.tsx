import React from 'react';
import { Mensagem } from '../services/chat/modelos/MensagemModel';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';

interface ChatWindowProps {
    messages: Mensagem[];
    isTyping: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isTyping }) => {
    return (
        <div className="flex-grow p-4 overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="flex flex-col space-y-2">
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
            </div>
        </div>
    );
};
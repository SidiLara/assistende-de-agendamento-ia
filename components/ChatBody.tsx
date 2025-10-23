
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface ChatBodyProps {
    messages: Message[];
    isTyping: boolean;
}

export const ChatBody: React.FC<ChatBodyProps> = ({ messages, isTyping }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 chat-container">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
        </div>
    );
};

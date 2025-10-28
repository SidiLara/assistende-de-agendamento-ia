import React from 'react';
import { Message, MessageSender } from '../types';

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.sender === MessageSender.User;

    const wrapperClasses = `flex items-end ${isUser ? 'justify-end' : 'justify-start'}`;
    const bubbleClasses = `max-w-md shadow-md py-3 px-5 text-base ${
        isUser
            ? 'bg-brand-green text-white rounded-2xl rounded-br-lg'
            : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-lg dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
    }`;

    return (
        <div className={`${wrapperClasses} animate-message`}>
             <div 
                className={bubbleClasses}
                dangerouslySetInnerHTML={{ __html: message.text }}
            />
        </div>
    );
};
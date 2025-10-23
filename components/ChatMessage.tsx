
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
            ? 'bg-green-600 text-white rounded-2xl rounded-br-lg'
            : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-lg'
    }`;

    return (
        <div className={wrapperClasses}>
             <div 
                className={bubbleClasses}
                dangerouslySetInnerHTML={{ __html: message.text }}
            />
        </div>
    );
};

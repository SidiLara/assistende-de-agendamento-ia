// FIX: Added React import. JSX syntax requires 'React' to be in scope.
import * as React from 'react';
import { RemetenteMensagem } from '../../servicos/chat/modelos/MensagemModel';
import { MensagemDeChatProps } from './MensagemDeChat.props';

export const MensagemDeChat = ({ message, consultantPhoto }: MensagemDeChatProps) => {
    const isUser = message.sender === RemetenteMensagem.User;
    const isNotice = message.isNotice ?? false;

    if (isNotice) {
        return (
            <div className="flex items-center justify-center my-2 animate-message">
                <div className="flex items-center space-x-3 max-w-md bg-yellow-100 dark:bg-notice-bg-dark border border-yellow-200 dark:border-notice-border-dark text-yellow-800 dark:text-notice-text-dark rounded-lg p-3 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div dangerouslySetInnerHTML={{ __html: message.text }} />
                </div>
            </div>
        );
    }

    const wrapperClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;
    const bubbleWrapperClasses = `relative flex-grow-0 max-w-md ${isUser ? 'order-1' : 'order-2'}`;
    const bubbleClasses = `shadow-md py-3 px-5 text-base ${
        isUser
            ? 'bg-blue-600 text-white rounded-2xl rounded-br-lg'
            : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-lg dark:bg-dark-secondary dark:text-gray-200 dark:border-slate-700'
    }`;
    const avatarClasses = `w-8 h-8 rounded-full object-cover flex-shrink-0 ${isUser ? 'order-2' : 'order-1'}`;

    return (
        <div className={`${wrapperClasses} animate-message`}>
            {!isUser && (
                <img
                    src={consultantPhoto}
                    alt="Avatar do Assistente"
                    className={avatarClasses}
                />
            )}
             <div className={bubbleWrapperClasses}>
                <div 
                    className={bubbleClasses}
                    dangerouslySetInnerHTML={{ __html: message.text }}
                />
             </div>
        </div>
    );
};
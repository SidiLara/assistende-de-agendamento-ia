import React, { useState } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isSending: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isSending }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isSending) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-grow p-2 border rounded-full bg-gray-100 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSending}
            />
            <button
                type="submit"
                className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={isSending}
            >
                {isSending ? 'Enviando...' : 'Enviar'}
            </button>
        </form>
    );
};
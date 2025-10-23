
import React, { useState, forwardRef } from 'react';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isSending: boolean;
    isDone: boolean;
    isActionPending: boolean;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(({ onSendMessage, isSending, isDone, isActionPending }, ref) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isSending && !isDone && !isActionPending) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };
    
    const isDisabled = isSending || isDone || isActionPending;
    let placeholderText = "Digite sua mensagem...";
    if (isDone) {
        placeholderText = "Agendamento concluído!";
    } else if (isActionPending) {
        placeholderText = "Selecione uma opção acima...";
    } else if (isSending) {
        placeholderText = "Aguarde...";
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
                ref={ref}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholderText}
                className="flex-1 w-full px-5 py-3 border-2 border-green-500 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:border-gray-300"
                autoComplete="off"
                disabled={isDisabled}
            />
            <button
                type="submit"
                className="bg-green-600 text-white rounded-full p-3 hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isDisabled}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
            </button>
        </form>
    );
});

ChatInput.displayName = 'ChatInput';
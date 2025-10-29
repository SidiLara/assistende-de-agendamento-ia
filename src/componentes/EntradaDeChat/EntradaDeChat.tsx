import { forwardRef, useState, FormEvent, ChangeEvent } from 'react';
import { EntradaDeChatProps } from './EntradaDeChat.props';

const applyWhatsappMask = (value: string): string => {
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    return value.slice(0, 15);
};

export const EntradaDeChat = forwardRef<HTMLInputElement, EntradaDeChatProps>(({ onSendMessage, isSending, isDone, isActionPending, nextKey }, ref) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isSending && !isDone && !isActionPending) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };
    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (nextKey === 'clientWhatsapp') {
            setInputValue(applyWhatsappMask(value));
        } else {
            setInputValue(value);
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
    } else if (nextKey === 'clientWhatsapp') {
        placeholderText = "(XX) 9XXXX-XXXX";
    }

    const inputType = nextKey === 'clientWhatsapp' ? 'tel' : 'text';

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
                ref={ref}
                type={inputType}
                value={inputValue}
                onChange={handleChange}
                placeholder={placeholderText}
                className="flex-1 w-full px-5 py-3 border-2 bg-transparent border-brand-green-light rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green-light focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:border-gray-300 dark:text-gray-100 dark:placeholder-gray-400 dark:disabled:bg-gray-700 dark:disabled:border-gray-600"
                autoComplete="off"
                disabled={isDisabled}
            />
            <button
                type="submit"
                className="bg-brand-green text-white rounded-full p-3 hover:bg-brand-green-dark transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
                disabled={isDisabled}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
            </button>
        </form>
    );
});

EntradaDeChat.displayName = 'EntradaDeChat';

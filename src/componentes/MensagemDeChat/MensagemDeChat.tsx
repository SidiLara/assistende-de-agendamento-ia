import { MessageSender } from '../../servicos/modelos/Mensagem.model';
import { MensagemDeChatProps } from './MensagemDeChat.props';

export const MensagemDeChat = ({ message }: MensagemDeChatProps) => {
    const isUser = message.sender === MessageSender.User;
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

    const wrapperClasses = `flex items-end ${isUser ? 'justify-end' : 'justify-start'}`;
    const bubbleClasses = `max-w-md shadow-md py-3 px-5 text-base ${
        isUser
            ? 'bg-brand-green text-white rounded-2xl rounded-br-lg'
            : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-lg dark:bg-dark-tertiary dark:text-gray-200 dark:border-slate-600'
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

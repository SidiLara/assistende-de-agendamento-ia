import { MensagemDeChatProps } from './MensagemDeChat.props';

export const MensagemDeChat = ({ message, consultantPhoto }: MensagemDeChatProps) => {
    const isUser = message.remetente === 'usuario';

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
                    dangerouslySetInnerHTML={{ __html: message.texto }}
                />
             </div>
        </div>
    );
};
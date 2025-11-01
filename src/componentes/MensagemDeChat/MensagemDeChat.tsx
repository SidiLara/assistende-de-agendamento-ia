import { RemetenteMensagem } from '../../servicos/chat/modelos/MensagemModel';
import { MensagemDeChatProps } from './MensagemDeChat.props';

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
    </svg>
);

const SpeakerWaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 3.667a.75.75 0 01.75.75v11.166a.75.75 0 01-1.5 0V4.417a.75.75 0 01.75-.75z" />
      <path d="M6.5 6.417a.75.75 0 01.75.75v5.666a.75.75 0 01-1.5 0V7.167a.75.75 0 01.75-.75z" />
      <path d="M3.5 8.667a.75.75 0 01.75.75v1.166a.75.75 0 01-1.5 0V9.417a.75.75 0 01.75-.75z" />
      <path d="M13.5 6.417a.75.75 0 01.75.75v5.666a.75.75 0 01-1.5 0V7.167a.75.75 0 01.75-.75z" />
      <path d="M16.5 8.667a.75.75 0 01.75.75v1.166a.75.75 0 01-1.5 0V9.417a.75.75 0 01.75-.75z" />
    </svg>
);

const LoadingSpinnerIcon = () => (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export const MensagemDeChat = ({ message, consultantPhoto, onPlayAudio, isPlaying, isLoading }: MensagemDeChatProps) => {
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
                {!isUser && (
                    <button 
                        onClick={() => onPlayAudio(message.text, message.id)}
                        className="absolute top-1 right-1 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        aria-label="Ouvir mensagem"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingSpinnerIcon /> : isPlaying ? <SpeakerWaveIcon /> : <SpeakerIcon />}
                    </button>
                )}
             </div>
        </div>
    );
};

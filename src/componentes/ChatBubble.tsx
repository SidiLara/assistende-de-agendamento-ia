import { Mensagem } from '../../servicos/chat/modelos/MensagemModel';

interface ChatBubbleProps {
    message: Mensagem;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const isUser = message.remetente === 'usuario';
    const bubbleClasses = isUser ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white self-start';

    return (
        <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-3 rounded-lg shadow-md ${bubbleClasses}`}>
            <p className="text-sm">{message.texto}</p>
        </div>
    );
};
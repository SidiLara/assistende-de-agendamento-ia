import * as React from 'react';
import { MensagemDeChat } from '../MensagemDeChat';
import { IndicadorDeDigitacao } from '../IndicadorDeDigitacao';
import { CorpoDoChatProps } from './CorpoDoChat.props';

export const CorpoDoChat: React.FC<CorpoDoChatProps> = ({ messages, isTyping }) => {
    const chatContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 chat-container bg-gray-100 dark:bg-dark-primary">
            {messages.map((msg) => (
                <MensagemDeChat key={msg.id} message={msg} />
            ))}
            {isTyping && <IndicadorDeDigitacao />}
        </div>
    );
};
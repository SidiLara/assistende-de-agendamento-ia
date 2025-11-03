import * as React from 'react';
import { MensagemDeChat } from '../MensagemDeChat';
import { IndicadorDeDigitacao } from '../IndicadorDeDigitacao';
import { CorpoDoChatProps } from './CorpoDoChat.props';

export const CorpoDoChat: React.FC<CorpoDoChatProps> = ({ messages, isTyping, consultantPhoto }) => {
    const chatContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 chat-container bg-transparent">
            {messages.map((msg) => (
                // FIX: Wrapped MensagemDeChat in React.Fragment and moved the key prop to it.
                // This resolves the TypeScript error where 'key' was being incorrectly validated against MensagemDeChatProps.
                <React.Fragment key={msg.id}>
                    <MensagemDeChat
                        message={msg}
                        consultantPhoto={consultantPhoto}
                    />
                </React.Fragment>
            ))}
            {isTyping && <IndicadorDeDigitacao />}
        </div>
    );
};

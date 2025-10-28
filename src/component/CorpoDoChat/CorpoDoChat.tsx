import React, { useEffect, useRef } from 'react';
import { MensagemDeChat } from '../MensagemDeChat/MensagemDeChat';
import { IndicadorDeDigitacao } from '../IndicadorDeDigitacao/IndicadorDeDigitacao';
import { CorpoDoChatProps } from './CorpoDoChatProps';

export const CorpoDoChat: React.FC<CorpoDoChatProps> = ({ messages, isTyping }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 chat-container bg-gray-100 dark:bg-gray-900">
            {messages.map((msg) => (
                <MensagemDeChat key={msg.id} message={msg} />
            ))}
            {isTyping && <IndicadorDeDigitacao />}
        </div>
    );
};

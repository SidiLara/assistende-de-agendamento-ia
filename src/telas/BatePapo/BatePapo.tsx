import { FC, useState, useEffect, useRef } from 'react';
import { CabecalhoDoChat } from '../../componentes/CabecalhoDoChat';
import { CorpoDoChat } from '../../componentes/CorpoDoChat';
import { EntradaDeChat } from '../../componentes/EntradaDeChat';
import { PillsDeAcao } from '../../componentes/PillsDeAcao';
import { useChatManager } from '../../hooks/useChatManager';
import { ChatConfig } from '../../servicos/modelos/ConfiguracaoChat.model';
import { FallbackRuleImpl } from '../../servicos/implementacao/FallbackRuleImpl';
import { ChatService } from '../../servicos/contratos/ChatService';
import { ChatServiceImpl } from '../../servicos/implementacao/ChatServiceImpl';
import { BatePapoProps } from './BatePapo.props';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const BatePapo: FC<BatePapoProps> = () => {
    const [config, setConfig] = useState<ChatConfig | null>(null);
    const [chatService, setChatService] = useState<ChatService | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        
        const appConfig: ChatConfig = {
            consultantName: urlParams.get('consultor') || 'Sidinei Lara',
            assistantName: urlParams.get('assistente') || 'Yannis',
            consultantPhoto: urlParams.get('foto') || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=128&h=128&fit=crop&crop=faces',
            webhookId: urlParams.get('webhook') || 'ud4aq9lrms2mfpce40ur6ac1papv68fi',
        };
        setConfig(appConfig);

        const fallbackRule = new FallbackRuleImpl();
        const service = new ChatServiceImpl(fallbackRule);
        setChatService(service);

        const pixelId = urlParams.get('pixelId');
        if (pixelId && !window.fbq) {
            const fbPixelScript = document.createElement('script');
            fbPixelScript.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(fbPixelScript);
        }
    }, []);
    
    const {
        messages,
        isTyping,
        isSending,
        isDone,
        actionOptions,
        isActionPending,
        nextKey,
        handleSendMessage,
        handlePillSelect,
    } = useChatManager(config, chatService);

    useEffect(() => {
        if (!isTyping && !isActionPending && !isDone) {
            inputRef.current?.focus();
        }
    }, [isTyping, isActionPending, isDone]);

    if (!config) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-green"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen font-sans">
            <div className="flex-1 min-h-0 flex justify-center items-center p-4">
                <div className="w-full max-w-xl h-full max-h-[90vh] bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl flex flex-col">
                    <CabecalhoDoChat 
                        consultantName={config.consultantName}
                        consultantPhoto={config.consultantPhoto}
                    />
                    <CorpoDoChat messages={messages} isTyping={isTyping} />
                    <div className="p-5 border-t border-gray-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary rounded-b-2xl">
                        {isActionPending && <PillsDeAcao options={actionOptions} onSelect={handlePillSelect} />}
                        <EntradaDeChat ref={inputRef} onSendMessage={handleSendMessage} isSending={isSending} isDone={isDone} isActionPending={isActionPending} nextKey={nextKey} />
                    </div>
                </div>
            </div>
             <footer className="text-center text-xs text-gray-600 dark:text-gray-400 p-4">
                Powered by Neural Chat | Direitos reservados para {config.consultantName}
            </footer>
        </div>
    );
};

import * as React from 'react';
import { CabecalhoDoChat } from '../../componentes/CabecalhoDoChat';
import { CorpoDoChat } from '../../componentes/CorpoDoChat';
import { EntradaDeChat } from '../../componentes/EntradaDeChat';
import { PillsDeAcao } from '../../componentes/PillsDeAcao';
import { useChatManager } from '../../hooks/useChatManager';
import { ConfiguracaoChat } from '../../servicos/chat/modelos/ConfiguracaoChatModel';
import { RegraFallbackImpl } from '../../servicos/chat/FallbackRuleImpl';
import { ServicoChat } from '../../servicos/chat/ChatService';
import { ServicoChatImpl } from '../../servicos/chat/ChatServiceImpl';
import { useDarkMode } from '../../hooks/useDarkMode';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const BatePapo: React.FC = () => {
    // State for chat
    const [config, setConfig] = React.useState<ConfiguracaoChat | null>(null);
    const [chatService, setChatService] = React.useState<ServicoChat | null>(null);
    
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { theme, toggleTheme } = useDarkMode();

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        
        const appConfig: ConfiguracaoChat = {
            consultantName: urlParams.get('consultor') || 'Sidinei Lara',
            assistantName: urlParams.get('assistente') || 'Yannis',
            consultantPhoto: urlParams.get('foto') || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=128&h=128&fit=crop&crop=faces',
            webhookId: urlParams.get('webhook') || 'ud4aq9lrms2mfpce40ur6ac1papv68fi',
        };
        setConfig(appConfig);

        // Fix: Per @google/genai guidelines, API key must be from process.env.API_KEY.
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.warn("Chave de API do Gemini não encontrada. O aplicativo será executado em modo de fallback. Certifique-se de configurar a variável de ambiente API_KEY em seu ambiente de hospedagem (ex: Vercel).");
        }

        const fallbackRule = new RegraFallbackImpl();
        const service = new ServicoChatImpl(fallbackRule, apiKey);
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

    React.useEffect(() => {
        if (!isTyping && !isActionPending && !isDone) {
            inputRef.current?.focus();
        }
    }, [isTyping, isActionPending, isDone]);

    if (!chatService || !config) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-200 dark:bg-dark-primary">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-green"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-200 dark:bg-dark-primary">
            <div className="flex-1 min-h-0 flex justify-center items-center p-4">
                <div className="w-full max-w-xl h-full max-h-[90vh] bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl flex flex-col">
                    <CabecalhoDoChat 
                        consultantName={config.consultantName}
                        consultantPhoto={config.consultantPhoto}
                        theme={theme}
                        toggleTheme={toggleTheme}
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

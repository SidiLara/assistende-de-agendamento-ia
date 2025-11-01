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
    const [config, setConfig] = React.useState<ConfiguracaoChat | null>(null);
    const [chatService, setChatService] = React.useState<ServicoChat | null>(null);
    const [isChatStarted, setIsChatStarted] = React.useState(false);
    
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

        const fallbackRule = new RegraFallbackImpl();
        const service = new ServicoChatImpl(fallbackRule);
        setChatService(service);

        const pixelId = urlParams.get('pixelId');
        if (pixelId && !window.fbq) {
            // ... (código do pixel do FB permanece o mesmo)
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
        if (messages.length > 0 && !isChatStarted) {
            const timer = setTimeout(() => {
                setIsChatStarted(true);
            }, 300); // Pequeno delay para garantir que a mensagem inicial seja renderizada antes da transição
            return () => clearTimeout(timer);
        }
    }, [messages, isChatStarted]);

    React.useEffect(() => {
        if (isChatStarted && !isTyping && !isActionPending && !isDone) {
            inputRef.current?.focus();
        }
    }, [isChatStarted, isTyping, isActionPending, isDone]);

    if (!config) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-200 dark:bg-dark-primary">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-200 dark:bg-dark-primary transition-colors duration-500 ease-in-out">
            <main className={`flex-1 min-h-0 flex flex-col transition-all duration-700 ease-in-out ${isChatStarted ? 'justify-start items-center' : 'justify-center items-center'}`}>
                <div className={`w-full flex flex-col transition-all duration-700 ease-in-out h-full max-w-2xl ${isChatStarted ? 'justify-between' : 'justify-center h-auto'}`}>
                    
                    <CabecalhoDoChat 
                        consultantName={config.consultantName}
                        assistantName={config.assistantName}
                        consultantPhoto={config.consultantPhoto}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        isChatStarted={isChatStarted}
                    />
                    
                    <div className={`flex-1 min-h-0 w-full transition-opacity duration-500 ease-in-out ${isChatStarted ? 'opacity-100' : 'opacity-0 h-0'}`}>
                        {isChatStarted && <CorpoDoChat messages={messages} isTyping={isTyping} />}
                    </div>
                    
                    <div className={`p-5 w-full transition-all duration-700 ease-in-out`}>
                        {isChatStarted && isActionPending && <PillsDeAcao options={actionOptions} onSelect={handlePillSelect} />}
                        <div className={`${isChatStarted ? '' : 'mt-8'}`}>
                            <EntradaDeChat ref={inputRef} onSendMessage={handleSendMessage} isSending={isSending} isDone={isDone} isActionPending={isActionPending} nextKey={nextKey} />
                        </div>
                    </div>
                </div>
            </main>

             <footer className={`text-center text-xs text-gray-600 dark:text-gray-400 p-4 transition-opacity duration-500 ${isChatStarted ? 'opacity-100' : 'opacity-0'}`}>
                Powered by Neural Chat | Direitos reservados para {config.consultantName}
            </footer>
        </div>
    );
};
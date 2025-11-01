import * as React from 'react';
import { CabecalhoDoChat } from '../../componentes/CabecalhoDoChat';
import { CorpoDoChat } from '../../componentes/CorpoDoChat';
import { EntradaDeChat } from '../../componentes/EntradaDeChat';
import { PillsDeAcao } from '../../componentes/PillsDeAcao';
import { useChatManager } from '../../hooks/useChatManager';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { ServicoChatImpl } from '../../servicos/chat/ChatServiceImpl';
import { RegraFallbackImpl } from '../../servicos/chat/FallbackRuleImpl';

export const BatePapo: React.FC = () => {
    const { theme, toggleTheme } = useDarkMode();

    const chatConfig = React.useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const consultantNameFromUrl = urlParams.get('consultor') || urlParams.get('consultant');
        const assistantNameFromUrl = urlParams.get('assistente') || urlParams.get('assistant');
        
        return {
            consultantName: consultantNameFromUrl || 'Consultor Sidinei Lara',
            assistantName: assistantNameFromUrl || 'Yannis',
            consultantPhoto: 'https://avatar.iran.liara.run/public/4',
            webhookId: 'your-webhook-id-here'
        };
    }, []);

    const chatService = React.useMemo(() => {
        const fallbackRule = new RegraFallbackImpl();
        return new ServicoChatImpl(fallbackRule);
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
    } = useChatManager(chatConfig, chatService);
    const { playAudio, isPlaying, isLoading } = useAudioPlayer(chatService);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const isChatStarted = messages.length > 0;

    React.useEffect(() => {
        if (!isActionPending && !isSending && !isDone) {
            inputRef.current?.focus();
        }
    }, [isActionPending, isSending, isDone, messages]);

    return (
        <div className="bg-gray-100 dark:bg-black min-h-dvh w-full flex items-center justify-center p-0 md:p-4">
            <div className="w-full h-dvh md:h-[85vh] md:max-h-[900px] md:max-w-4xl lg:max-w-5xl md:rounded-2xl md:shadow-xl flex flex-col bg-transparent text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300 overflow-hidden">
                
                {/* O cabeçalho agora está sempre presente e anima sua posição e conteúdo */}
                <header className={`
                    z-10 transition-all duration-700 ease-in-out
                    ${!isChatStarted 
                        ? 'flex-1 flex flex-col' // Ocupa o espaço principal para centralizar
                        : 'flex-none' // Encolhe para o tamanho do conteúdo
                    }
                `}>
                    <CabecalhoDoChat
                        consultantName={chatConfig.consultantName}
                        assistantName={chatConfig.assistantName}
                        consultantPhoto={chatConfig.consultantPhoto}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        isChatStarted={isChatStarted}
                    />
                </header>

                {/* O corpo principal do chat, que aparece suavemente */}
                <main className={`
                    flex flex-col overflow-hidden transition-all duration-500
                    ${isChatStarted 
                        ? 'flex-1 opacity-100' // Ocupa o espaço restante e aparece
                        : 'h-0 opacity-0 pointer-events-none' // Fica oculto e sem espaço
                    }
                `}>
                    <CorpoDoChat
                        messages={messages}
                        isTyping={isTyping}
                        consultantPhoto={chatConfig.consultantPhoto}
                        onPlayAudio={playAudio}
                        isPlaying={isPlaying}
                        isLoading={isLoading}
                    />
                </main>

                {/* Rodapé fixo para a entrada de texto */}
                <footer className="flex-shrink-0 p-4 md:px-6 md:pb-6">
                    {isActionPending && actionOptions.length > 0 && (
                        <PillsDeAcao options={actionOptions} onSelect={handlePillSelect} />
                    )}
                    <EntradaDeChat
                        ref={inputRef}
                        onSendMessage={handleSendMessage}
                        isSending={isSending}
                        isDone={isDone}
                        isActionPending={isActionPending}
                        nextKey={nextKey}
                        assistantName={chatConfig.assistantName}
                    />
                </footer>
            </div>
        </div>
    );
};
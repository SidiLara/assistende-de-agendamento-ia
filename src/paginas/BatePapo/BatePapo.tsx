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
        
        return {
            consultantName: consultantNameFromUrl || 'Consultor Sidinei Lara',
            assistantName: 'Yannis',
            consultantPhoto: 'https://lh3.googleusercontent.com/pw/AP1GczNjDUpGj9SrkxSb0twW-X4VpKtzDwhNTEirCxk1fyEGfo6NTNIOW7qM2kifnymFOrJ0v6LuSn6sThGMj3_E_Vxgf2ld3-IHsDdewbd7aqtuCP6xqELBx3IC0_10oKCQyiEKXTyl6aBCi5crsAyGEHda7A=w801-h801-s-no-gm',
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

    const footerClasses = "bg-transparent";

    return (
        <div className="bg-gray-100 dark:bg-black min-h-dvh w-full flex items-center justify-center p-0 md:p-4">
            <div className="w-full h-dvh md:h-auto md:max-h-[95vh] md:max-w-4xl md:rounded-2xl md:shadow-xl flex flex-col bg-transparent text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300 overflow-hidden relative">
                {isChatStarted && (
                    <header className="flex-shrink-0 z-10 bg-white dark:bg-dark-secondary shadow-md dark:shadow-slate-900">
                        <CabecalhoDoChat
                            consultantName={chatConfig.consultantName}
                            assistantName={chatConfig.assistantName}
                            consultantPhoto={chatConfig.consultantPhoto}
                            theme={theme}
                            toggleTheme={toggleTheme}
                            isChatStarted={isChatStarted}
                        />
                    </header>
                )}

                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Área de rolagem para o conteúdo do chat */}
                    <div className={`flex-1 overflow-y-auto p-4 md:p-6 flex flex-col ${!isChatStarted ? 'justify-center' : ''}`}>
                        {!isChatStarted && (
                            <div className="mb-auto mt-auto">
                                <CabecalhoDoChat
                                    consultantName={chatConfig.consultantName}
                                    assistantName={chatConfig.assistantName}
                                    consultantPhoto={chatConfig.consultantPhoto}
                                    theme={theme}
                                    toggleTheme={toggleTheme}
                                    isChatStarted={isChatStarted}
                                />
                            </div>
                        )}
                        {isChatStarted && (
                            <CorpoDoChat
                                messages={messages}
                                isTyping={isTyping}
                                consultantPhoto={chatConfig.consultantPhoto}
                                onPlayAudio={playAudio}
                                isPlaying={isPlaying}
                                isLoading={isLoading}
                            />
                        )}
                    </div>

                    {/* Rodapé fixo para a entrada de texto */}
                    <div className={`flex-shrink-0 p-4 md:px-6 md:pb-6 transition-colors duration-300 ${footerClasses}`}>
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
                    </div>
                </main>
            </div>
        </div>
    );
};
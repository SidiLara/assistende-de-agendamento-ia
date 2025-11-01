import * as React from 'react';
import { CabecalhoDoChat } from '../../componentes/CabecalhoDoChat';
import { CorpoDoChat } from '../../componentes/CorpoDoChat';
import { EntradaDeChat } from '../../componentes/EntradaDeChat';
import { PillsDeAcao } from '../../componentes/PillsDeAcao';
import { useGerenciadorDeChat } from '../../hooks/useGerenciadorDeChat';
import { useDarkMode } from '../../hooks/useDarkMode';
import { ServicoChatImpl } from '../../servicos/chat/ServicoChatImpl';
import { RegraFallbackImpl } from '../../servicos/chat/RegraFallbackImpl';
import { ServicoCrmApi, ServicoGeminiApi } from '../../servicos/api';

export const BatePapo: React.FC = () => {
    const { theme, toggleTheme } = useDarkMode();

    const chatConfig = React.useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const consultantNameFromUrl = urlParams.get('consultor') || urlParams.get('consultant');
        
        return {
            consultantName: consultantNameFromUrl || 'Consultor Sidinei Lara',
            assistantName: 'Yannis',
            consultantPhoto: 'https://lh3.googleusercontent.com/pw/AP1GczNjDUpGj9Srkxsb0twW-X4VpKtzDwhNTEirCxk1fyEGfo6NTNIOW7qM2kifnymFOrJ0v6LuSn6sThGMj3_E_Vxgf2ld3-IHsDdewbd7aqtuCP6xqELBx3IC0_10oKCQyiEKXTyl6aBCi5crsAyGEHda7A=w801-h801-s-no-gm',
            webhookId: 'your-webhook-id-here'
        };
    }, []);

    const chatService = React.useMemo(() => {
        const fallbackRule = new RegraFallbackImpl();
        const geminiApi = new ServicoGeminiApi();
        const crmApi = new ServicoCrmApi();
        return new ServicoChatImpl(fallbackRule, geminiApi, crmApi);
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
    } = useGerenciadorDeChat(chatConfig, chatService);

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
            <div className="w-full h-dvh md:h-[85vh] md:max-h-[900px] md:max-w-4xl lg:max-w-5xl md:rounded-2xl md:shadow-xl flex flex-col bg-transparent text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300 overflow-hidden relative">
                {isChatStarted && (
                    <header className="flex-shrink-0 z-10 bg-transparent">
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
                            />
                        )}
                    </div>

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

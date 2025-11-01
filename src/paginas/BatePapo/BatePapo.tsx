import * as React from 'react';
import { CabecalhoDoChat } from '../../componentes/CabecalhoDoChat';
import { CorpoDoChat } from '../../componentes/CorpoDoChat';
import { EntradaDeChat } from '../../componentes/EntradaDeChat';
import { PillsDeAcao } from '../../componentes/PillsDeAcao';
import { useChatManager } from '../../hooks/useChatManager';
import { useDarkMode } from '../../hooks/useDarkMode';
import { ConfiguracaoChat } from '../../servicos/chat/modelos/ConfiguracaoChatModel';
import { ServicoChatImpl } from '../../servicos/chat/ChatServiceImpl';
import { RegraFallbackImpl } from '../../servicos/chat/FallbackRuleImpl';

// In a real app, this would come from a config file or API.
const chatConfig: ConfiguracaoChat = {
    consultantName: 'Glauber',
    assistantName: 'G.E.M.S.',
    consultantPhoto: 'https://lh3.googleusercontent.com/a/ACg8ocK_345-c4h033p8Sbv52nO0j58GmsGgsIuU7s0-x-7oBPA=s576-c-no',
    webhookId: 'your-webhook-id-here' // This should be configured.
};

const fallbackRule = new RegraFallbackImpl();
const chatService = new ServicoChatImpl(fallbackRule);

export const BatePapo: React.FC = () => {
    const { theme, toggleTheme } = useDarkMode();
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

    const inputRef = React.useRef<HTMLInputElement>(null);
    const isChatStarted = messages.length > 0;

    React.useEffect(() => {
        if (!isActionPending && !isSending && !isDone) {
            inputRef.current?.focus();
        }
    }, [isActionPending, isSending, isDone, messages]);

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-dark-primary text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
            {/* O cabeçalho só é renderizado como uma barra superior se o chat tiver começado */}
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
                <div className={`flex-1 overflow-y-auto p-4 md:p-6 flex flex-col ${!isChatStarted ? 'justify-center' : ''}`}>
                    {/* A tela de boas-vindas é mostrada aqui quando o chat não começou */}
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
                    {/* O corpo do chat só aparece quando há mensagens */}
                    {isChatStarted && <CorpoDoChat messages={messages} isTyping={isTyping} consultantPhoto={chatConfig.consultantPhoto} />}
                </div>
                
                <div className="p-4 md:px-6 md:pb-6 bg-transparent">
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
    );
};
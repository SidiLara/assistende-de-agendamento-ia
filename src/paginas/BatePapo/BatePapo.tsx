import * as React from 'react';
import { CabecalhoDoChat } from '../../componentes/CabecalhoDoChat';
import { CorpoDoChat } from '../../componentes/CorpoDoChat';
import { EntradaDeChat } from '../../componentes/EntradaDeChat';
import { PillsDeAcao } from '../../componentes/PillsDeAcao';
import { useGerenciadorDeChat } from '../../hooks/useGerenciadorDeChat';
import { useDarkMode } from '../../hooks/useDarkMode';
import { ServicoChatImpl } from '../../servicos/chat/ServicoChatImpl';
import { RegraFallbackImpl } from '../../servicos/chat/RegraFallbackImpl';
import { ServicoGeminiApi } from '../../servicos/api/ServicoGeminiApi';
import { ServicoCrmApi } from '../../servicos/api/ServicoCrmApi';
import { ConfiguracaoChat } from '../../servicos/chat/modelos/ConfiguracaoChatModel';

// Componente para exibir o estado de carregamento
const TelaDeCarregamento: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <p className="text-lg animate-pulse">Carregando assistente...</p>
    </div>
);

// Componente para exibir mensagens de erro
const TelaDeErro: React.FC<{ mensagem: string }> = ({ mensagem }) => (
    <div className="flex items-center justify-center h-full text-center">
        <p className="text-lg text-red-500">{mensagem}</p>
    </div>
);

export const BatePapo: React.FC = () => {
    const { theme, toggleTheme } = useDarkMode();
    
    const [chatConfig, setChatConfig] = React.useState<ConfiguracaoChat | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetchConfig = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            // Se nenhum ID for encontrado, usa 'default' como padrão.
            const id = urlParams.get('id') || 'default'; 

            try {
                // Em desenvolvimento, a URL completa é necessária.
                // Em produção, a Vercel resolve /api/config automaticamente.
                const apiUrl = process.env.NODE_ENV === 'development' 
                    ? `http://localhost:5173/api/config?id=${id}` 
                    : `/api/config?id=${id}`;

                const response = await fetch(apiUrl);

                if (!response.ok) {
                    const errorData = await response.json();
                    // Mensagem de erro mais amigável se a configuração padrão falhar
                    if (id === 'default') {
                         throw new Error("A configuração padrão não foi encontrada. Por favor, contate o suporte.");
                    }
                    throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
                }

                const configData = await response.json();

                setChatConfig({
                    consultantName: configData.consultor,
                    assistantName: configData.assistente,
                    webhookId: configData.webhook,
                    consultantPhoto: 'https://lh3.googleusercontent.com/pw/AP1GczOxgZ0lrck55UZFbbWy6VGdzVypbfV4mlqEAwytyyDe_MCrMLs3FgfTCOiOe3sHpKsF_QMw7hweBRi8oU2WGYD1SoWBlUCwU1IFOmJUCgqfFSsX4020goytb0Pkef-nvQSg4f5NRt9gDa4Fnx5WsFDSOQ=w801-h801-s-no-gm',
                });

            } catch (err: any) {
                setError(`Falha ao carregar a configuração: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
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

    const renderContent = () => {
        if (isLoading) {
            return <TelaDeCarregamento />;
        }
        if (error) {
            return <TelaDeErro mensagem={error} />;
        }
        if (chatConfig) {
            return (
                <>
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
                </>
            );
        }
        return null; // Caso de fallback, não deve acontecer
    };

    return (
        <div className="bg-gray-100 dark:bg-black min-h-dvh w-full flex items-center justify-center p-0 md:p-4">
            <div className="w-full h-dvh md:h-[85vh] md:max-h-[900px] md:max-w-4xl lg:max-w-5xl md:rounded-2xl md:shadow-xl flex flex-col bg-transparent text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300 overflow-hidden relative">
                {renderContent()}
            </div>
        </div>
    );
};

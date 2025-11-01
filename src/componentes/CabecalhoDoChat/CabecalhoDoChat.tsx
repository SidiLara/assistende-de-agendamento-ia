import { CabecalhoDoChatProps } from './CabecalhoDoChat.props';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

export const CabecalhoDoChat = ({ consultantName, assistantName, consultantPhoto, theme, toggleTheme, isChatStarted }: CabecalhoDoChatProps) => {
    
    // Layout de boas-vindas (estilo Gemini)
    if (!isChatStarted) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-5 transition-all duration-700 ease-in-out">
                <img
                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg mb-4 dark:border-dark-tertiary"
                    src={consultantPhoto}
                    alt={consultantName}
                />
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-brand-green-light dark:from-brand-blue dark:to-brand-green-light">
                    Olá, sou o {assistantName}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Como posso ajudar a planejar seu projeto hoje?</p>
            </div>
        );
    }

    // Layout de cabeçalho do chat ativo (estilo Gemini moderno)
    return (
        <div className="p-5 flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={consultantPhoto}
                        alt={consultantName}
                    />
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-brand-green ring-2 ring-dark-primary"></span>
                </div>
                <div>
                    <h1 className="text-md font-bold text-gray-800 dark:text-gray-100">Assistente de Pré-Consultoria</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{consultantName}, Consultor</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Alternar tema"
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
                <img
                    src="https://lh3.googleusercontent.com/pw/AP1GczMLLmTFX3k4nI61XGKYxWDQxtvpRlW1pj6emtnu7C43TsWql3583NdeDKjg4sTNz6qGGhPR-TDbnFX0X-NCQxGeQdU7rFj92z0hHzHrYwKa4HDg4tEZTGRYpjk7dTUlDfodrt8IQsMGePi24SS5ThxR2g=w900-h900-s-no-gm"
                    alt="Logo"
                    className="h-8 w-8"
                />
            </div>
        </div>
    );
};
import { CabecalhoDoChatProps } from './CabecalhoDoChat.props';
import { Avatar } from '../Avatar';
import { LogoEmpresa } from '../LogoEmpresa';

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
                <div className="mb-4">
                    <Avatar src={consultantPhoto} alt={consultantName} size="large" />
                </div>
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
                <Avatar src={consultantPhoto} alt={consultantName} size="small" showStatus={true} />
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
                <LogoEmpresa />
            </div>
        </div>
    );
};

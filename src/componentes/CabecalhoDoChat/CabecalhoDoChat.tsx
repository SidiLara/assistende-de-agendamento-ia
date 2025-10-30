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


export const CabecalhoDoChat = ({ consultantName, consultantPhoto, theme, toggleTheme }: CabecalhoDoChatProps) => {
    return (
        <div className="p-5 border-b border-gray-200 dark:border-dark-tertiary flex items-center justify-between bg-white dark:bg-dark-secondary rounded-t-2xl">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img
                        className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                        src={consultantPhoto}
                        alt={consultantName}
                    />
                    <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-brand-green ring-2 ring-white dark:ring-dark-secondary"></span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Assistente de Pré-Consultoria</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{consultantName}, Consultor</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
                    aria-label="Alternar tema"
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
                <img
                    src="https://lh3.googleusercontent.com/pw/AP1GczMLLmTFX3k4nI61XGKYxWDQxtvpRlW1pj6emtnu7C43TsWql3583NdeDKjg4sTNz6qGGhPR-TDbnFX0X-NCQxGeQdU7rFj92z0hHzHrYwKa4HDg4tEZTGRYpjk7dTUlDfodrt8IQsMGePi24SS5ThxR2g=w900-h900-s-no-gm"
                    alt="Logo"
                    className="h-9 w-9"
                />
            </div>
        </div>
    );
};
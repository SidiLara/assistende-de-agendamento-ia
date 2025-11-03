import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface HeaderProps {
    consultantName: string;
    assistantName: string;
    assistantTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ consultantName, assistantName, assistantTitle }) => {
    const { theme, toggleTheme } = useDarkMode();

    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{consultantName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{assistantTitle} com {assistantName}</p>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </header>
    );
};
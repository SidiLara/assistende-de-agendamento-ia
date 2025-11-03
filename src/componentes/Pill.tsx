import React from 'react';

interface PillProps {
    label: string;
    value: string;
    chave: string;
    onClick: (value: string, chave: string) => void;
}

export const Pill: React.FC<PillProps> = ({ label, value, chave, onClick }) => {
    return (
        <button
            onClick={() => onClick(value, chave)}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
        >
            {label}
        </button>
    );
};
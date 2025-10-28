import React from 'react';
import { PillsDeAcaoProps } from './PillsDeAcaoProps';

export const PillsDeAcao: React.FC<PillsDeAcaoProps> = ({ options, onSelect }) => {
    return (
        <div className="flex justify-start flex-wrap gap-2 py-2 mb-2">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => onSelect(option.value, option.label)}
                    className={`text-sm font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 border transform active:scale-95 ${
                        option.value === 'confirm'
                            ? 'bg-brand-green text-white border-brand-green hover:bg-brand-green-dark'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

import React from 'react';

interface PillOption {
    label: string;
    value: string;
}

interface ActionPillsProps {
    options: PillOption[];
    onSelect: (value: string, label?: string) => void;
}

export const ActionPills: React.FC<ActionPillsProps> = ({ options, onSelect }) => {
    return (
        <div className="flex justify-start flex-wrap gap-2 py-2 mb-2">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => onSelect(option.value, option.label)}
                    className={`text-sm font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 border transform active:scale-95 ${
                        option.value === 'confirm'
                            ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};
import React from 'react';
import { Pill } from './Pill';
import { OpcaoDeAcao } from '../../servicos/chat/InterfacesChat';

interface PillContainerProps {
    options: OpcaoDeAcao[];
    onPillSelect: (value: string, key: string) => void;
}

export const PillContainer: React.FC<PillContainerProps> = ({ options, onPillSelect }) => {
    if (!options.length) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {options.map((option) => (
                <Pill
                    key={option.chave}
                    label={option.label}
                    value={option.valor}
                    chave={option.chave}
                    onClick={onPillSelect}
                />
            ))}
        </div>
    );
};
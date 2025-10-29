import * as React from 'react';
import { CabecalhoDoChatProps } from './CabecalhoDoChatProps';

export const CabecalhoDoChat: React.FC<CabecalhoDoChatProps> = ({ consultantName, consultantPhoto }) => {
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
            <img 
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSI4IiBmaWxsPSIjREMyNjI2Ii8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yNCA2bC0xNCAxMmg0djE0aDh2LThoNHY4aDhWMTJoNHoiLz48L3N2Zz4="
                alt="Logo" 
                className="h-9 w-9"
            />
        </div>
    );
};
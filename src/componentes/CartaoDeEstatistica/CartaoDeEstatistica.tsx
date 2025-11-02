import * as React from 'react';
import { CartaoDeEstatisticaProps } from './CartaoDeEstatistica.props';

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


export const CartaoDeEstatistica: React.FC<CartaoDeEstatisticaProps> = ({ titulo, valor, icone, mudanca, corMudanca }) => {
    const corTextoMudanca = corMudanca === 'positivo' ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{titulo}</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{valor}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-brand-blue rounded-full p-3">
                    {icone}
                </div>
            </div>
            {mudanca && (
                <div className={`flex items-center mt-4 text-sm ${corTextoMudanca}`}>
                    {corMudanca === 'positivo' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    <span className="ml-1 font-semibold">{mudanca}</span>
                </div>
            )}
        </div>
    );
};

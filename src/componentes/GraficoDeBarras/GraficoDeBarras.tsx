import * as React from 'react';
import { GraficoDeBarrasProps } from './GraficoDeBarras.props';

export const GraficoDeBarras: React.FC<GraficoDeBarrasProps> = ({ data, titulo }) => {
    const maxValue = React.useMemo(() => Math.max(...data.map(d => d.value), 0), [data]);

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{titulo}</h3>
            <div className="flex justify-between items-end h-64 space-x-2 md:space-x-4">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div
                            className="w-full bg-blue-400 dark:bg-brand-blue rounded-t-md transition-all duration-500 ease-out"
                            style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                            title={`${item.label}: ${item.value}`}
                        ></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center break-words">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

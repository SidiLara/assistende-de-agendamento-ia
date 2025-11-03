import * as React from 'react';
import { Link } from 'react-router-dom';
import { CartaoDeAcaoProps } from './CartaoDeAcao.props';

export const CartaoDeAcao: React.FC<CartaoDeAcaoProps> = ({ titulo, linkPara, icone }) => {
    return (
        <Link to={linkPara} className="group block bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:border-brand-blue hover:-translate-y-1">
            <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-brand-blue rounded-lg p-3 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                    {icone}
                </div>
                <h3 className="ml-4 text-lg font-bold text-gray-800 dark:text-gray-100">{titulo}</h3>
            </div>
        </Link>
    );
};

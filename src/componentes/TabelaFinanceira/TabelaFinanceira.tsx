import * as React from 'react';
import { TabelaFinanceiraProps } from './TabelaFinanceira.props';
import { StatusCliente, TipoEntidade } from '../../servicos/gestaoClientes/modelos/ClienteModel';

const statusStyles: Record<StatusCliente, string> = {
    'Ativo': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Inativo': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
};

const tipoStyles: Record<TipoEntidade, string> = {
    'Cliente': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'Consultor': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
};

export const TabelaFinanceira: React.FC<TabelaFinanceiraProps> = ({ entidades }) => {

    const formatCurrency = (value = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 p-6">Detalhamento da Receita</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-dark-tertiary">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plano</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor Mensal</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-slate-700">
                        {entidades.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    Nenhuma receita encontrada para o período.
                                </td>
                            </tr>
                        ) : (
                            entidades.map((entidade) => (
                                <tr key={entidade.id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{entidade.nome}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tipoStyles[entidade.tipo]}`}>
                                            {entidade.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-300">{entidade.plano}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-gray-100">{formatCurrency(entidade.valorPlano)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[entidade.status]}`}>
                                            {entidade.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
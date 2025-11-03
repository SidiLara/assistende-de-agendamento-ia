import * as React from 'react';
import { TabelaFinanceiraProps } from './TabelaFinanceira.props';
import { StatusCliente, TipoEntidade } from '../../servicos/gestaoClientes/modelos/ClienteModel';

const statusStyles: Record<StatusCliente, string> = {
    'Ativo': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Inativo': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Pendente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
};

const tipoStyles: Record<TipoEntidade, string> = {
    'Cliente': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-brand-blue',
    'Consultor': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
};

export const TabelaFinanceira: React.FC<TabelaFinanceiraProps> = ({ dados }) => {
    const [filtro, setFiltro] = React.useState('');
    const [dadosFiltrados, setDadosFiltrados] = React.useState(dados);

    React.useEffect(() => {
        setDadosFiltrados(
            dados.filter(item => 
                item.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                item.plano.toLowerCase().includes(filtro.toLowerCase())
            )
        );
    }, [filtro, dados]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4">
                 <input
                    type="text"
                    placeholder="Filtrar por nome ou plano..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-dark-tertiary">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plano</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status (Mês Atual)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-slate-700">
                        {dadosFiltrados.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tipoStyles[item.tipo]}`}>
                                        {item.tipo}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.plano}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(item.valorPlano)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[item.status]}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                         {dadosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Nenhum item encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

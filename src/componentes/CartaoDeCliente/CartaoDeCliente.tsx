import * as React from 'react';
import { CartaoDeClienteProps } from './CartaoDeCliente.props';
import { TipoPlano, StatusCliente } from '../../servicos/gestaoClientes/modelos/ClienteModel';

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const PlanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 22.444a12.02 12.02 0 009-1.5z" />
    </svg>
);

const planStyles: Record<TipoPlano, { badge: string, text: string }> = {
    'Premium': { badge: 'bg-yellow-400 dark:bg-yellow-500', text: 'text-yellow-800 dark:text-yellow-100' },
    'Básico': { badge: 'bg-blue-400 dark:bg-blue-500', text: 'text-blue-800 dark:text-blue-100' },
    'Empresarial': { badge: 'bg-purple-400 dark:bg-purple-500', text: 'text-purple-800 dark:text-purple-100' },
};

const statusStyles: Record<StatusCliente, string> = {
    'Ativo': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Inativo': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
};


export const CartaoDeCliente: React.FC<CartaoDeClienteProps> = ({ cliente, planos, onEditar, onToggleStatus }) => {
    const { nome, plano, telefone, status } = cliente;
    const planStyle = planStyles[plano];
    const statusStyle = statusStyles[status];
    const nomePlanoCompleto = `Plano ${plano}`;
    const planoInfo = planos.find(p => p.nome === nomePlanoCompleto);
    const valorPlanoFormatado = planoInfo ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planoInfo.valor) : 'N/A';

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700 transition-shadow hover:shadow-lg min-h-[190px] flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 break-words pr-2">{nome}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyle} flex-shrink-0`}>
                        {status}
                    </span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <PhoneIcon />
                        <span>{telefone}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <PlanIcon />
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${planStyle.badge} ${planStyle.text}`}>
                           {plano}
                        </span>
                        <span className="ml-2">({valorPlanoFormatado})</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                <label className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={status === 'Ativo'} onChange={() => onToggleStatus(cliente)} />
                        <div className={`block w-14 h-8 rounded-full transition ${status === 'Ativo' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${status === 'Ativo' ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {status === 'Ativo' ? 'Ativo' : 'Inativo'}
                    </div>
                </label>

                <button
                    onClick={() => onEditar(cliente)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/50 dark:text-brand-blue dark:hover:bg-blue-900"
                >
                    Editar
                </button>
            </div>
        </div>
    );
};

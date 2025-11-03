import * as React from 'react';
import { CartaoDeConsultorProps } from './CartaoDeConsultor.props';
import { TipoPlano } from '../../services/gestaoCrm/modelos/ConsultorModel';

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
    'Premium': {
        badge: 'bg-yellow-400 dark:bg-yellow-500',
        text: 'text-yellow-800 dark:text-yellow-100'
    },
    'Básico': {
        badge: 'bg-blue-400 dark:bg-blue-500',
        text: 'text-blue-800 dark:text-blue-100'
    }
};

export const CartaoDeConsultor: React.FC<CartaoDeConsultorProps> = ({ consultor, planos, onEditar }) => {
    const { nome, plano, telefone } = consultor;
    const styles = planStyles[plano];
    const nomePlanoCompleto = `Plano ${plano}`;
    const planoInfo = planos.find(p => p.nome === nomePlanoCompleto);
    const valorPlanoFormatado = planoInfo ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planoInfo.valor) : 'N/A';

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700 transition-shadow hover:shadow-lg min-h-[190px] flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">{nome}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles.badge} ${styles.text}`}>
                        {plano}
                    </span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <PhoneIcon />
                        <span>{telefone}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <PlanIcon />
                        <span>{nomePlanoCompleto} ({valorPlanoFormatado})</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <button
                    onClick={() => onEditar(consultor)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/50 dark:text-brand-blue dark:hover:bg-blue-900"
                >
                    Editar
                </button>
            </div>
        </div>
    );
};

import { CartaoDePlanoProps } from './CartaoDePlano.props';

export const CartaoDePlano = ({ plano }: CartaoDePlanoProps) => {
    const { nome, valor } = plano;

    const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700 transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{nome}</h3>
            <p className="text-3xl font-light text-blue-600 dark:text-brand-blue">{valorFormatado}</p>
        </div>
    );
};
import { CartaoDeClienteProps } from './CartaoDeCliente.props';
import { StatusCliente } from '../../servicos/gestaoClientes/modelos/ClienteModel';

const statusStyles: Record<StatusCliente, { badge: string, text: string }> = {
    'Novo': { badge: 'bg-gray-200 dark:bg-gray-600', text: 'text-gray-800 dark:text-gray-100' },
    'Em Contato': { badge: 'bg-blue-200 dark:bg-blue-800', text: 'text-blue-800 dark:text-blue-100' },
    'Agendado': { badge: 'bg-yellow-200 dark:bg-yellow-800', text: 'text-yellow-800 dark:text-yellow-100' },
    'Convertido': { badge: 'bg-green-200 dark:bg-green-800', text: 'text-green-800 dark:text-green-100' },
    'Perdido': { badge: 'bg-red-200 dark:bg-red-800', text: 'text-red-800 dark:text-red-100' },
};

export const CartaoDeCliente = ({ cliente }: CartaoDeClienteProps) => {
    const { nome, status, consultorResponsavel, telefone, email } = cliente;
    const styles = statusStyles[status];

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{nome}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles.badge} ${styles.text}`}>
                    {status}
                </span>
            </div>
            <div className="space-y-3 text-sm">
                <p className="text-gray-600 dark:text-gray-300"><strong>Consultor:</strong> {consultorResponsavel}</p>
                <p className="text-gray-600 dark:text-gray-300"><strong>Telefone:</strong> {telefone}</p>
                <p className="text-gray-600 dark:text-gray-300"><strong>Email:</strong> {email}</p>
            </div>
        </div>
    );
};

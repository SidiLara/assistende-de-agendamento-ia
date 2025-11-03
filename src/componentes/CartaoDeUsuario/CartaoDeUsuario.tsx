import { CartaoDeUsuarioProps } from './CartaoDeUsuario.props';
import { Role } from '../../servicos/gestaoUsuarios/modelos/UsuarioModel';

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const RoleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9l4 4m0-4l-4 4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 22.444a12.02 12.02 0 009-1.5z" />
    </svg>
);


const roleStyles: Record<Role, { badge: string, text: string }> = {
    'Admin': {
        badge: 'bg-red-400 dark:bg-red-500',
        text: 'text-red-800 dark:text-red-100'
    },
    'Consultor': {
        badge: 'bg-green-400 dark:bg-green-500',
        text: 'text-green-800 dark:text-green-100'
    }
};

export const CartaoDeUsuario = ({ usuario }: CartaoDeUsuarioProps) => {
    const { email, role } = usuario;
    const styles = roleStyles[role];

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{email}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles.badge} ${styles.text}`}>
                    {role}
                </span>
            </div>
            <div className="space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <EmailIcon />
                    <span>{email}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <RoleIcon />
                    <span>Papel: {role}</span>
                </div>
            </div>
        </div>
    );
};

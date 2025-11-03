import * as React from 'react';
import { FormularioAdicionarUsuarioProps } from './FormularioAdicionarUsuario.props';
import { Role } from '../../servicos/gestaoUsuarios/modelos/UsuarioModel';

export const FormularioAdicionarUsuario = ({ onSalvar, onCancelar }: FormularioAdicionarUsuarioProps) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [role, setRole] = React.useState<Role>('Consultor');
    const [erro, setErro] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setErro('Email e senha são obrigatórios.');
            return;
        }
        setErro('');
        onSalvar({ email, password, role });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email do Usuário</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    placeholder="Ex: consultor@empresa.com"
                />
            </div>
             <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    placeholder="Crie uma senha forte"
                />
            </div>
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Papel</label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md bg-white dark:bg-dark-tertiary"
                >
                    <option>Consultor</option>
                    <option>Admin</option>
                </select>
            </div>
            
            {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
            <div className="flex justify-end space-x-3 pt-2">
                <button
                    type="button"
                    onClick={onCancelar}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-dark-tertiary dark:text-gray-200 dark:border-slate-600 dark:hover:bg-slate-600"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Salvar
                </button>
            </div>
        </form>
    );
};

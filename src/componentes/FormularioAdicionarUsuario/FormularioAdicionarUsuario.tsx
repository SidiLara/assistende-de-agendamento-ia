import * as React from 'react';
import { FormularioAdicionarUsuarioProps } from './FormularioAdicionarUsuario.props';
import { Role } from '../../servicos/gestaoUsuarios';

export const FormularioAdicionarUsuario: React.FC<FormularioAdicionarUsuarioProps> = ({ onSalvar, onCancelar, isSaving, apiError }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [role, setRole] = React.useState<Role>('Consultor');
    const [erro, setErro] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        
        if (!email.trim() || !password.trim()) {
            setErro('Email e senha são obrigatórios.');
            return;
        }

        if (password !== confirmPassword) {
            setErro('As senhas não coincidem.');
            return;
        }
        
        onSalvar({ email, password, role });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email-usuario" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email do Usuário</label>
                <input type="email" id="email-usuario" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary" placeholder="usuario@email.com"/>
            </div>
            <div>
                <label htmlFor="senha-usuario" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                <input type="password" id="senha-usuario" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary" placeholder="********"/>
            </div>
            <div>
                <label htmlFor="confirmar-senha-usuario" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Senha</label>
                <input type="password" id="confirmar-senha-usuario" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary" placeholder="********"/>
            </div>
            <div>
                <label htmlFor="role-usuario" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Papel</label>
                <select id="role-usuario" value={role} onChange={(e) => setRole(e.target.value as Role)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md bg-white dark:bg-dark-tertiary">
                    <option value="Consultor">Consultor</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>
           
            {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
            {apiError && <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>}
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancelar} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-dark-tertiary dark:text-gray-200 dark:border-slate-600 dark:hover:bg-slate-600 disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
};

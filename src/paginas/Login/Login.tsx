import * as React from 'react';
import { useAuth } from '../../hooks/useAuth';
// FIX: Changed to a named import to address module resolution errors.
import { useNavigate } from 'react-router-dom';
import { LogoEmpresa } from '../../componentes/LogoEmpresa';

export const Login: React.FC = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/crm');
        } catch (err: any) {
            setError(err.message || 'Falha no login. Verifique suas credenciais.');
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-dark-primary min-h-dvh w-full flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-dark-secondary rounded-xl shadow-2xl p-8">
                <div className="flex justify-center mb-6">
                    <LogoEmpresa />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">Acesso ao CRM</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Entre com suas credenciais.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                            placeholder="Sua senha"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500"
                        >
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
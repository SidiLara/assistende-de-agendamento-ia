import * as React from 'react';
import { FormularioAdicionarPlanoProps } from './FormularioAdicionarPlano.props';

export const FormularioAdicionarPlano: React.FC<FormularioAdicionarPlanoProps> = ({ onSalvar, onCancelar, isSaving, apiError }) => {
    const [nome, setNome] = React.useState('');
    const [valor, setValor] = React.useState('');
    const [erro, setErro] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valorNumerico = parseFloat(valor.replace(',', '.'));

        if (!nome.trim() || isNaN(valorNumerico) || valorNumerico <= 0) {
            setErro('Nome e valor (positivo) são obrigatórios.');
            return;
        }

        setErro('');
        onSalvar({ nome, valor: valorNumerico });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="nome-plano" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Plano</label>
                <input
                    type="text"
                    id="nome-plano"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    placeholder="Ex: Plano Básico"
                />
            </div>
            <div>
                <label htmlFor="valor-plano" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
                <input
                    type="text"
                    id="valor-plano"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    placeholder="Ex: 99,90"
                />
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

import * as React from 'react';
import { FormularioAdicionarClienteProps } from './FormularioAdicionarCliente.props';
import { TipoPlano } from '../../servicos/gestaoClientes/modelos/ClienteModel';
import { applyWhatsappMask } from '../../utils/formatters/Phone';

export const FormularioAdicionarCliente = ({ onSalvar, onCancelar }: FormularioAdicionarClienteProps) => {
    const [nome, setNome] = React.useState('');
    const [plano, setPlano] = React.useState<TipoPlano>('Básico');
    const [telefone, setTelefone] = React.useState('');
    const [erro, setErro] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome.trim() || !telefone.trim()) {
            setErro('Nome e telefone são obrigatórios.');
            return;
        }
        setErro('');
        onSalvar({ nome, plano, telefone });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Cliente</label>
                <input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    placeholder="Ex: João da Silva ou Acme Inc."
                />
            </div>
            <div>
                <label htmlFor="plano" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plano</label>
                <select
                    id="plano"
                    value={plano}
                    onChange={(e) => setPlano(e.target.value as TipoPlano)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md bg-white dark:bg-dark-tertiary"
                >
                    <option>Básico</option>
                    <option>Premium</option>
                    <option>Empresarial</option>
                </select>
            </div>
             <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                <input
                    type="tel"
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(applyWhatsappMask(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    placeholder="(XX) 9XXXX-XXXX"
                />
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
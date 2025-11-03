import * as React from 'react';
import { FormularioAdicionarTransacaoProps } from './FormularioAdicionarTransacao.props';

export const FormularioAdicionarTransacao: React.FC<FormularioAdicionarTransacaoProps> = ({
    onSalvar, onCancelar, clientes, planos, consultores, isSaving, apiError
}) => {
    const [clienteId, setClienteId] = React.useState('');
    const [planoId, setPlanoId] = React.useState('');
    const [consultorId, setConsultorId] = React.useState('');
    const [valor, setValor] = React.useState('');
    const [dataVenda, setDataVenda] = React.useState(new Date().toISOString().split('T')[0]);
    const [erro, setErro] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valorNumerico = parseFloat(valor.replace(',', '.'));

        if (!clienteId || !planoId || !consultorId || !dataVenda || isNaN(valorNumerico) || valorNumerico <= 0) {
            setErro('Todos os campos são obrigatórios e o valor deve ser positivo.');
            return;
        }

        setErro('');
        onSalvar({ dataVenda, clienteId, planoId, consultorId, valor: valorNumerico });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="cliente-transacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
                    <select id="cliente-transacao" value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md bg-white dark:bg-dark-tertiary">
                        <option value="">Selecione um cliente</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="consultor-transacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Consultor</label>
                    <select id="consultor-transacao" value={consultorId} onChange={(e) => setConsultorId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md bg-white dark:bg-dark-tertiary">
                         <option value="">Selecione um consultor</option>
                        {consultores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="plano-transacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plano</label>
                    <select id="plano-transacao" value={planoId} onChange={(e) => setPlanoId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md bg-white dark:bg-dark-tertiary">
                         <option value="">Selecione um plano</option>
                        {planos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="valor-transacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
                    <input type="text" id="valor-transacao" value={valor} onChange={(e) => setValor(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary" placeholder="Ex: 199,90"/>
                </div>
                <div>
                    <label htmlFor="data-transacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data da Venda</label>
                    <input type="date" id="data-transacao" value={dataVenda} onChange={(e) => setDataVenda(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary" />
                </div>
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

import * as React from 'react';
import { FormularioAdicionarClienteProps } from './FormularioAdicionarCliente.props';
import { TipoPlano, TipoPagamento, TipoEntidade } from '../../servicos/gestaoClientes/modelos/ClienteModel';
import { applyWhatsappMask } from '../../utils/formatters/Phone';

export const FormularioAdicionarCliente = ({ clienteParaEditar, planosDisponiveis, onSalvar, onCancelar }: FormularioAdicionarClienteProps) => {
    const [nome, setNome] = React.useState('');
    const [tipo, setTipo] = React.useState<TipoEntidade>('Cliente');
    const [plano, setPlano] = React.useState<TipoPlano>('Básico');
    const [telefone, setTelefone] = React.useState('');
    const [dataInicio, setDataInicio] = React.useState(new Date().toISOString().split('T')[0]);
    const [tipoPagamento, setTipoPagamento] = React.useState<TipoPagamento>('Fixo');
    const [numeroParcelas, setNumeroParcelas] = React.useState<number | undefined>(12);
    const [erro, setErro] = React.useState('');

    React.useEffect(() => {
        if (clienteParaEditar) {
            setNome(clienteParaEditar.nome);
            setTipo(clienteParaEditar.tipo);
            setPlano(clienteParaEditar.plano);
            setTelefone(clienteParaEditar.telefone);
            setDataInicio(clienteParaEditar.dataInicio || new Date().toISOString().split('T')[0]);
            setTipoPagamento(clienteParaEditar.tipoPagamento || 'Fixo');
            setNumeroParcelas(clienteParaEditar.numeroParcelas || 12);
        } else {
            // Reset para valores padrão ao adicionar novo
            setNome('');
            setTipo('Cliente');
            setPlano('Básico');
            setTelefone('');
            setDataInicio(new Date().toISOString().split('T')[0]);
            setTipoPagamento('Fixo');
            setNumeroParcelas(12);
        }
    }, [clienteParaEditar]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome.trim() || !telefone.trim() || !dataInicio) {
            setErro('Nome, telefone e data de início são obrigatórios.');
            return;
        }
        if (tipoPagamento === 'Parcelado' && (!numeroParcelas || numeroParcelas <= 0)) {
            setErro('O número de parcelas deve ser um valor positivo.');
            return;
        }
        setErro('');
        onSalvar({ nome, tipo, plano, telefone, dataInicio, tipoPagamento, numeroParcelas: tipoPagamento === 'Parcelado' ? numeroParcelas : undefined });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                    <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary" placeholder="Ex: Empresa Exemplo" />
                </div>
                <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                    <input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(applyWhatsappMask(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary" placeholder="(XX) 9XXXX-XXXX" />
                </div>
                 <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                    <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoEntidade)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md bg-white dark:bg-dark-tertiary">
                        <option value="Cliente">Cliente</option>
                        <option value="Consultor">Consultor</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="plano" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plano</label>
                    <select id="plano" value={plano} onChange={(e) => setPlano(e.target.value as TipoPlano)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md bg-white dark:bg-dark-tertiary">
                        {planosDisponiveis.map(p => ( <option key={p.id} value={p.nome.split(' ')[1] as TipoPlano}>{p.nome}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
                    <input type="date" id="dataInicio" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary" />
                </div>
                 <div>
                    <label htmlFor="tipoPagamento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Pagamento</label>
                    <select id="tipoPagamento" value={tipoPagamento} onChange={(e) => setTipoPagamento(e.target.value as TipoPagamento)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md bg-white dark:bg-dark-tertiary">
                        <option value="Fixo">Fixo (Recorrente)</option>
                        <option value="Parcelado">Parcelado</option>
                    </select>
                </div>
                {tipoPagamento === 'Parcelado' && (
                    <div>
                        <label htmlFor="numeroParcelas" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nº de Parcelas</label>
                        <input type="number" id="numeroParcelas" value={numeroParcelas} onChange={(e) => setNumeroParcelas(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary" placeholder="Ex: 12" />
                    </div>
                )}
            </div>
            
            {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancelar} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-dark-tertiary dark:text-gray-200 dark:border-slate-600 dark:hover:bg-slate-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Salvar</button>
            </div>
        </form>
    );
};
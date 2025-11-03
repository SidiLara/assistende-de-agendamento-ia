import * as React from 'react';
import { ServicoFinanceiro, RelatorioFinanceiro } from '../../servicos/financeiro';
import { getFriendlyApiError } from '../../utils/apiErrorHandler';
import { CartaoDeEstatistica } from '../../componentes/CartaoDeEstatistica';
import { TabelaFinanceira } from '../../componentes/TabelaFinanceira';

const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 14v4m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 14c-1.657 0-3-.895-3-2s1.343-2 3-2" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;


const meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
];

const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export const Financeiro: React.FC = () => {
    const [relatorio, setRelatorio] = React.useState<RelatorioFinanceiro | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [mesSelecionado, setMesSelecionado] = React.useState(new Date().getMonth() + 1);
    const [anoSelecionado, setAnoSelecionado] = React.useState(new Date().getFullYear());

    const financeiroService = React.useMemo(() => new ServicoFinanceiro(), []);

    React.useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // @ts-ignore
                const data = await financeiroService.getRelatorioFinanceiro(mesSelecionado, anoSelecionado);
                setRelatorio(data);
            } catch (err) {
                console.error("Erro ao buscar relatório financeiro:", err);
                setError(getFriendlyApiError(err, 'o relatório financeiro'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [financeiroService, mesSelecionado, anoSelecionado]);
    
    const formatCurrency = (value = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold flex-shrink-0">Relatório Financeiro</h1>
                 <div className="flex gap-4">
                    <select
                        value={mesSelecionado}
                        onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    >
                        {meses.map(mes => <option key={mes.value} value={mes.value}>{mes.label}</option>)}
                    </select>
                    <select
                        value={anoSelecionado}
                        onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    >
                        {anos.map(ano => <option key={ano} value={ano}>{ano}</option>)}
                    </select>
                </div>
            </div>

             {isLoading ? (
                <p>Carregando relatório...</p>
            ) : error ? (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            ) : relatorio ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <CartaoDeEstatistica 
                            titulo="Receita Total no Mês"
                            valor={formatCurrency(relatorio.receitaTotal)}
                            icone={<CurrencyDollarIcon />}
                        />
                        <CartaoDeEstatistica 
                            titulo="Assinaturas Ativas"
                            valor={relatorio.assinaturasAtivas.toString()}
                            icone={<ClipboardCheckIcon />}
                        />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4">Detalhamento por Entidade</h2>
                    <TabelaFinanceira dados={relatorio.receitaPorEntidade} />
                </>
            ) : (
                <p>Nenhum dado financeiro encontrado para o período selecionado.</p>
            )}
        </div>
    );
};

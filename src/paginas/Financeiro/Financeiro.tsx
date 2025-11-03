import * as React from 'react';
import { CartaoDeEstatistica } from '../../componentes/CartaoDeEstatistica';
import { TabelaFinanceira } from '../../componentes/TabelaFinanceira';
import { ServicoFinanceiro, RelatorioFinanceiro } from '../../servicos/financeiro';
import { getFriendlyApiError } from '../../utils/apiErrorHandler';

// Icons
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 14v4m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 14c-1.657 0-3-.895-3-2s1.343 2 3-2" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const ArrowTrendingDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.328 4.329 7.09-7.09" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 18H21V13.5" /></svg>;


export const Financeiro: React.FC = () => {
    const [relatorio, setRelatorio] = React.useState<RelatorioFinanceiro | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    
    const financeiroService = React.useMemo(() => new ServicoFinanceiro(), []);

    React.useEffect(() => {
        const fetchRelatorio = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await financeiroService.getRelatorioFinanceiro();
                setRelatorio(data);
            } catch (err) {
                console.error("Erro ao buscar relatório financeiro:", err);
                setError(getFriendlyApiError(err, 'o relatório financeiro'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchRelatorio();
    }, [financeiroService]);
    
    const formatCurrency = (value = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold flex-shrink-0">Visão Financeira</h1>
            </div>

            {isLoading ? (
                <p>Carregando dados financeiros...</p>
            ) : error ? (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            ) : relatorio ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <CartaoDeEstatistica 
                            titulo="Receita Mensal Recorrente"
                            valor={formatCurrency(relatorio.receitaTotal)}
                            icone={<CurrencyDollarIcon />}
                        />
                         <CartaoDeEstatistica 
                            titulo="Assinaturas Ativas"
                            valor={relatorio.assinaturasAtivas.toString()}
                            icone={<ClipboardCheckIcon />}
                        />
                        <CartaoDeEstatistica 
                            titulo="Despesas (Previsto)"
                            valor={formatCurrency(0)}
                            icone={<ArrowTrendingDownIcon />}
                        />
                    </div>

                    <TabelaFinanceira entidades={relatorio.receitaPorEntidade} />
                </>
            ) : (
                <p>Nenhum dado financeiro encontrado.</p>
            )}
        </div>
    );
};

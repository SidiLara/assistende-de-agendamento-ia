import * as React from 'react';
import { CartaoDeEstatistica } from '../../componentes/CartaoDeEstatistica';
import { GraficoDeBarras } from '../../componentes/GraficoDeBarras';
import { ServicoEstatisticas, EstatisticasData } from '../../services/estatisticas';
import { getFriendlyApiError } from '../../utils/apiErrorHandler';

// Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.965 5.965 0 0112 13a5.965 5.965 0 013 1.803" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 14v4m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 14c-1.657 0-3-.895-3-2s1.343-2 3-2" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;

const meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
];

const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export const Estatisticas: React.FC = () => {
    const [stats, setStats] = React.useState<EstatisticasData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [mesSelecionado, setMesSelecionado] = React.useState(new Date().getMonth() + 1);
    const [anoSelecionado, setAnoSelecionado] = React.useState(new Date().getFullYear());

    const estatisticasService = React.useMemo(() => new ServicoEstatisticas(), []);

    React.useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await estatisticasService.getEstatisticas(mesSelecionado, anoSelecionado);
                setStats(data);
            } catch (err) {
                console.error("Erro ao buscar estatísticas:", err);
                setError(getFriendlyApiError(err, 'as estatísticas'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [estatisticasService, mesSelecionado, anoSelecionado]);
    
    const formatCurrency = (value = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold flex-shrink-0">Estatísticas</h1>
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
                <p>Carregando estatísticas...</p>
            ) : error ? (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            ) : stats ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <CartaoDeEstatistica 
                            titulo="Total de Clientes"
                            valor={stats.totalClientes.toString()}
                            icone={<UsersIcon />}
                        />
                         <CartaoDeEstatistica 
                            titulo="Total de Consultores"
                            valor={stats.totalConsultores.toString()}
                            icone={<BriefcaseIcon />}
                        />
                        <CartaoDeEstatistica 
                            titulo="Faturamento no Mês"
                            valor={formatCurrency(stats.faturamentoMensal)}
                            icone={<CurrencyDollarIcon />}
                        />
                        <CartaoDeEstatistica 
                            titulo="Vendas no Mês"
                            valor={stats.vendasNoMes.toString()}
                            icone={<ClipboardCheckIcon />}
                        />
                    </div>

                    <GraficoDeBarras 
                        titulo={`Faturamento por Dia - ${meses.find(m => m.value === mesSelecionado)?.label}/${anoSelecionado}`}
                        data={stats.faturamentoPorDia}
                    />
                </>
            ) : (
                <p>Nenhuma estatística encontrada para o período selecionado.</p>
            )}
        </div>
    );
};

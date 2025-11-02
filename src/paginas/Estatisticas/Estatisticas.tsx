import * as React from 'react';
import { CartaoDeEstatistica } from '../../componentes/CartaoDeEstatistica';

// --- Ícones para os cartões de estatística ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1.5a2.5 2.5 0 00-5 0V21" /></svg>;
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


export const Estatisticas: React.FC = () => {
    // Dados de exemplo para as estatísticas
    const statsData = [
        {
            titulo: 'Total de Leads Gerados',
            valor: '1,284',
            icone: <UsersIcon />,
            mudanca: '+12.5% vs. mês passado',
            corMudanca: 'positivo' as const,
        },
        {
            titulo: 'Taxa de Conversão',
            valor: '23.8%',
            icone: <ChartPieIcon />,
            mudanca: '+1.2% vs. mês passado',
            corMudanca: 'positivo' as const,
        },
        {
            titulo: 'Valor Médio de Crédito',
            valor: 'R$ 185.000',
            icone: <CurrencyDollarIcon />,
            mudanca: '-2.1% vs. mês passado',
            corMudanca: 'negativo' as const,
        },
        {
            titulo: 'Agendamentos Concluídos',
            valor: '305',
            icone: <CheckCircleIcon />,
            mudanca: '+8% vs. mês passado',
            corMudanca: 'positivo' as const,
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Estatísticas de Desempenho</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map(stat => (
                    <CartaoDeEstatistica
                        key={stat.titulo}
                        titulo={stat.titulo}
                        valor={stat.valor}
                        icone={stat.icone}
                        mudanca={stat.mudanca}
                        corMudanca={stat.corMudanca}
                    />
                ))}
            </div>

            <div className="mt-10 bg-white dark:bg-dark-secondary p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Em Breve</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Mais gráficos e relatórios detalhados serão adicionados a esta página em futuras atualizações.
                </p>
            </div>
        </div>
    );
};

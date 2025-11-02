import * as React from 'react';
import { CartaoDeEstatistica } from '../../componentes/CartaoDeEstatistica';

// Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-2 10v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2" /></svg>;

export const Estatisticas: React.FC = () => {
    // Dados mockados para as estatísticas
    const stats = [
        { titulo: 'Total de Clientes', valor: '1,254', icone: <UsersIcon />, mudanca: '+12.5%', corMudanca: 'positivo' as const },
        { titulo: 'Receita Mensal (MRR)', valor: 'R$ 87.5k', icone: <CashIcon />, mudanca: '+5.2%', corMudanca: 'positivo' as const },
        { titulo: 'Taxa de Conversão', valor: '4.8%', icone: <ChartPieIcon />, mudanca: '-0.3%', corMudanca: 'negativo' as const },
        { titulo: 'Novos Consultores', valor: '8', icone: <UserGroupIcon />, mudanca: '+2', corMudanca: 'positivo' as const },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Estatísticas e Desempenho</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <CartaoDeEstatistica
                        key={index}
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
                    Gráficos interativos e relatórios detalhados estarão disponíveis nesta seção em futuras atualizações.
                </p>
            </div>
        </div>
    );
};

import * as React from 'react';
import { CartaoDeEstatistica } from '../../componentes/CartaoDeEstatistica';
import { GraficoDeBarras } from '../../componentes/GraficoDeBarras';

// Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.965 5.965 0 0112 13a5.965 5.965 0 013 1.803" /></svg>;
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 14v4m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 14c-1.657 0-3-.895-3-2s1.343-2 3-2" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;

const leadsPorMesData = [
    { label: 'Jan', value: 65 },
    { label: 'Fev', value: 59 },
    { label: 'Mar', value: 80 },
    { label: 'Abr', value: 81 },
    { label: 'Mai', value: 56 },
    { label: 'Jun', value: 55 },
];

export const Estatisticas: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Estatísticas</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <CartaoDeEstatistica 
                    titulo="Total de Clientes"
                    valor="1,284"
                    icone={<UsersIcon />}
                    mudanca="+2.5%"
                    corMudanca="positivo"
                />
                <CartaoDeEstatistica 
                    titulo="Receita Mensal"
                    valor="R$ 25.4k"
                    icone={<CurrencyDollarIcon />}
                    mudanca="+5.1%"
                    corMudanca="positivo"
                />
                <CartaoDeEstatistica 
                    titulo="Leads Convertidos"
                    valor="312"
                    icone={<ClipboardCheckIcon />}
                    mudanca="-1.2%"
                    corMudanca="negativo"
                />
            </div>

            <GraficoDeBarras 
                titulo="Leads Gerados por Mês"
                data={leadsPorMesData}
            />
        </div>
    );
};

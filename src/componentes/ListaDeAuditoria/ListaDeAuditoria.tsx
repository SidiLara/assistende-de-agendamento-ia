import * as React from 'react';
import { ListaDeAuditoriaProps } from './ListaDeAuditoria.props';
import { CartaoDeAuditoria } from '../CartaoDeAuditoria';
import { LogAuditoria } from '../../servicos/auditoria';

export const ListaDeAuditoria = ({ logs }: ListaDeAuditoriaProps) => {
    if (!logs.length) {
        return <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Nenhum log encontrado para os filtros selecionados.</p>;
    }

    const logsByMonth = logs.reduce((acc, log) => {
        const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(log.timestamp);
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(log);
        return acc;
    }, {} as Record<string, LogAuditoria[]>);

    return (
        <div className="space-y-8">
            {Object.entries(logsByMonth).map(([monthYear, monthLogs]) => (
                <div key={monthYear}>
                    <h2 className="text-xl font-semibold my-4 sticky top-0 bg-gray-100 dark:bg-dark-primary py-2 z-10 capitalize">
                        {monthYear}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {monthLogs.map(log => (
                            <React.Fragment key={log.id}>
                                <CartaoDeAuditoria log={log} />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

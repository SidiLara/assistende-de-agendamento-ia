import * as React from 'react';
import { ListaDeAuditoriaProps } from './ListaDeAuditoria.props';
import { CartaoDeAuditoria } from '../CartaoDeAuditoria';

export const ListaDeAuditoria = ({ logs }: ListaDeAuditoriaProps) => {
    if (!logs.length) {
        return <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Nenhum log de auditoria encontrado.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map(log => (
                <React.Fragment key={log.id}>
                    <CartaoDeAuditoria log={log} />
                </React.Fragment>
            ))}
        </div>
    );
};
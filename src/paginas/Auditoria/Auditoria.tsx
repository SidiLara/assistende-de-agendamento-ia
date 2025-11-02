import * as React from 'react';
import { ServicoAuditoria, LogAuditoria } from '../../servicos/auditoria';
import { ListaDeAuditoria } from '../../componentes/ListaDeAuditoria';

export const Auditoria: React.FC = () => {
    const [logs, setLogs] = React.useState<LogAuditoria[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    
    const auditoriaService = React.useMemo(() => new ServicoAuditoria(), []);

    React.useEffect(() => {
        auditoriaService.getLogs()
            .then(data => {
                setLogs(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar logs de auditoria:", error);
                setIsLoading(false);
            });
    }, [auditoriaService]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Logs de Auditoria</h1>
            {isLoading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Carregando logs...</p>
            ) : (
                <ListaDeAuditoria logs={logs} />
            )}
        </div>
    );
};
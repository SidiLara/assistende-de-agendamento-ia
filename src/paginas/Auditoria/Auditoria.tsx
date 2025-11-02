import * as React from 'react';
import { ServicoAuditoria, LogAuditoria, AcaoAuditoria } from '../../servicos/auditoria';

const actionStyles: Record<AcaoAuditoria, string> = {
    CRIACAO: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    ATUALIZACAO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    EXCLUSAO: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    LOGIN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
};

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

    const formatadorData = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium',
    });

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Logs de Auditoria</h1>
            <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-dark-tertiary">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data/Hora</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ação</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center">Carregando logs...</td>
                                </tr>
                            ) : logs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatadorData.format(log.timestamp)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{log.usuario}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${actionStyles[log.acao]}`}>
                                            {log.acao}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.detalhes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

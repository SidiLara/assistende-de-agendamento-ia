import * as React from 'react';
import { ServicoAuditoria, LogAuditoria } from '../../services/auditoria';
import { ListaDeAuditoria } from '../../componentes/ListaDeAuditoria';

export const Auditoria: React.FC = () => {
    const [logs, setLogs] = React.useState<LogAuditoria[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    
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

    const filteredLogs = React.useMemo(() => {
        return logs.filter(log => {
            const logDate = log.timestamp;
            const searchTermLower = searchTerm.toLowerCase();

            const searchMatch = searchTerm === '' ||
                log.usuario.toLowerCase().includes(searchTermLower) ||
                log.detalhes.toLowerCase().includes(searchTermLower) ||
                log.acao.toLowerCase().includes(searchTermLower) ||
                log.entidade.toLowerCase().includes(searchTermLower);

            const startDateMatch = startDate === '' || logDate >= new Date(startDate + 'T00:00:00');
            const endDateMatch = endDate === '' || logDate <= new Date(endDate + 'T23:59:59');
            
            return searchMatch && startDateMatch && endDateMatch;
        });
    }, [logs, searchTerm, startDate, endDate]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Logs de Auditoria</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white dark:bg-dark-secondary rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="md:col-span-1">
                    <label htmlFor="search-audit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pesquisar</label>
                    <input
                        type="text"
                        id="search-audit"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar por usuário, ação, detalhes..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    />
                </div>
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
                    <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Final</label>
                    <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    />
                </div>
            </div>

            {isLoading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Carregando logs...</p>
            ) : (
                <ListaDeAuditoria logs={filteredLogs} />
            )}
        </div>
    );
};

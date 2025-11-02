import { LogAuditoria } from './modelos/LogAuditoriaModel';
import { IServicoAuditoria } from './InterfacesAuditoria';

const mockLogs: LogAuditoria[] = [
    { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 5), usuario: 'Sidinei Lara', acao: 'LOGIN', entidade: 'Sistema', entidadeId: 'system', detalhes: 'Login bem-sucedido.' },
    { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 3), usuario: 'Admin', acao: 'CRIACAO', entidade: 'Cliente', entidadeId: '4', detalhes: 'Cliente "Consultoria Delta" criado.' },
    { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 2), usuario: 'Admin', acao: 'ATUALIZACAO', entidade: 'Cliente', entidadeId: '3', detalhes: 'Status do cliente "Tecnologia Gamma" alterado para Inativo.' },
    { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 1), usuario: 'Maria Silva', acao: 'LOGIN', entidade: 'Sistema', entidadeId: 'system', detalhes: 'Login bem-sucedido.' },
];

export class ServicoAuditoria implements IServicoAuditoria {
    public async getLogs(): Promise<LogAuditoria[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                // Sort by most recent
                resolve([...mockLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
            }, 500);
        });
    }

    public async addLog(logData: Omit<LogAuditoria, 'id' | 'timestamp'>): Promise<LogAuditoria> {
        return new Promise(resolve => {
            setTimeout(() => {
                const novoLog: LogAuditoria = {
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    ...logData
                };
                mockLogs.push(novoLog);
                resolve(novoLog);
            }, 100);
        });
    }
}
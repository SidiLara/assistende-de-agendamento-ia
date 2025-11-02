import { LogAuditoria } from "./modelos/LogAuditoriaModel";
import { IServicoAuditoria } from "./InterfacesAuditoria";

const mockLogs: LogAuditoria[] = [
    { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 5), usuario: 'Sidinei Lara', acao: 'LOGIN', entidade: 'Sistema', entidadeId: 'system', detalhes: 'Login bem-sucedido.' },
    { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 10), usuario: 'Sidinei Lara', acao: 'ATUALIZACAO', entidade: 'Cliente', entidadeId: '1', detalhes: 'Status do cliente "Empresa Alpha" alterado para Ativo.' },
    { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 25), usuario: 'Maria Silva', acao: 'CRIACAO', entidade: 'Consultor', entidadeId: '5', detalhes: 'Novo consultor "Roberto Carlos" adicionado.' },
    { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 40), usuario: 'Admin', acao: 'EXCLUSAO', entidade: 'Plano', entidadeId: '4', detalhes: 'Plano "Plano Teste" foi removido.' },
];

export class ServicoAuditoria implements IServicoAuditoria {
    public async getLogs(): Promise<LogAuditoria[]> {
        return new Promise(resolve => {
            setTimeout(() => {
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

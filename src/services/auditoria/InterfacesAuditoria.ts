import { LogAuditoria } from './modelos/LogAuditoriaModel';

export interface IServicoAuditoria {
    getLogs(): Promise<LogAuditoria[]>;
    addLog(logData: Omit<LogAuditoria, 'id' | 'timestamp'>): Promise<LogAuditoria>;
}

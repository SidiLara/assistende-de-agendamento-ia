import { LogAuditoria } from './modelos/LogAuditoriaModel';
import { IServicoAuditoria } from './InterfacesAuditoria';

const API_BASE_URL = '/api/auditoria';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export class ServicoAuditoria implements IServicoAuditoria {
    public async getLogs(): Promise<LogAuditoria[]> {
        const response = await fetch(API_BASE_URL);
        const logs = await handleResponse(response);
        // Garante que o timestamp seja um objeto Date
        return logs.map((log: any) => ({ ...log, timestamp: new Date(log.timestamp) }));
    }

    public async addLog(logData: Omit<LogAuditoria, 'id' | 'timestamp'>): Promise<LogAuditoria> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });
        return handleResponse(response);
    }
}

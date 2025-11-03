// api/auditoria.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';
import { LogAuditoria } from '../src/servicos/auditoria';

const SHEET_NAME = 'Auditoria';
const HEADERS = ['id', 'timestamp', 'usuario', 'acao', 'entidade', 'entidadeId', 'detalhes'];
const RANGE = `${SHEET_NAME}!A:G`;

const rowsToLogs = (rows: any[][]): LogAuditoria[] => {
    if (!rows || rows.length < 2) return [];
    const header = rows[0];
    const data = rows.slice(1);
    
    const idIndex = header.indexOf('id');
    const timestampIndex = header.indexOf('timestamp');
    const usuarioIndex = header.indexOf('usuario');
    const acaoIndex = header.indexOf('acao');
    const entidadeIndex = header.indexOf('entidade');
    const entidadeIdIndex = header.indexOf('entidadeId');
    const detalhesIndex = header.indexOf('detalhes');

    return data.map(row => ({
        id: row[idIndex],
        timestamp: new Date(row[timestampIndex]),
        usuario: row[usuarioIndex],
        acao: row[acaoIndex],
        entidade: row[entidadeIndex],
        entidadeId: row[entidadeIdIndex],
        detalhes: row[detalhesIndex],
    }));
};

const getLogs = async (): Promise<LogAuditoria[]> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    return rowsToLogs(response.data.values || []);
};

const addLog = async (logData: Omit<LogAuditoria, 'id' | 'timestamp'>): Promise<LogAuditoria> => {
    const sheets = await getSheetsClient();
    const novoLog: LogAuditoria = {
        id: Date.now().toString(),
        timestamp: new Date(),
        ...logData
    };

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[novoLog.id, novoLog.timestamp.toISOString(), novoLog.usuario, novoLog.acao, novoLog.entidade, novoLog.entidadeId, novoLog.detalhes]]
        }
    });

    return novoLog;
};

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        await ensureSheetExists(sheets, SPREADSHEET_ID!, SHEET_NAME, HEADERS);

        if (req.method === 'GET') {
            const logs = await getLogs();
            // Sort by most recent before sending
            const sortedLogs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            res.status(200).json(sortedLogs);
        } else if (req.method === 'POST') {
            const novoLog = await addLog(req.body);
            res.status(201).json(novoLog);
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("Erro na API de Auditoria:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição.', details: message });
    }
}

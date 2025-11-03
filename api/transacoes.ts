// api/transacoes.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';
import { Transacao } from '../src/servicos/transacoes';

const SHEET_NAME = 'Vendas'; // Usando a aba de Vendas
const HEADERS = ['id', 'dataVenda', 'clienteId', 'planoId', 'consultorId', 'valor'];
const RANGE = `${SHEET_NAME}!A:F`;

// Helper to convert sheet rows to Transacao objects
const rowsToTransacoes = (rows: any[][]): Transacao[] => {
    if (!rows || rows.length < 2) return [];
    const header = rows[0];
    const data = rows.slice(1);

    const idIndex = header.indexOf('id');
    const dataVendaIndex = header.indexOf('dataVenda');
    const clienteIdIndex = header.indexOf('clienteId');
    const planoIdIndex = header.indexOf('planoId');
    const consultorIdIndex = header.indexOf('consultorId');
    const valorIndex = header.indexOf('valor');

    return data.map(row => ({
        id: row[idIndex],
        dataVenda: row[dataVendaIndex],
        clienteId: row[clienteIdIndex],
        planoId: row[planoIdIndex],
        consultorId: row[consultorIdIndex],
        valor: parseFloat(row[valorIndex]),
    }));
};

const getTransacoes = async (): Promise<Transacao[]> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    return rowsToTransacoes(response.data.values || []);
};

const addTransacao = async (transacaoData: Omit<Transacao, 'id'>): Promise<Transacao> => {
    const sheets = await getSheetsClient();
    const novaTransacao: Transacao = {
        id: Date.now().toString(),
        ...transacaoData
    };

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                novaTransacao.id, novaTransacao.dataVenda, novaTransacao.clienteId,
                novaTransacao.planoId, novaTransacao.consultorId, novaTransacao.valor
            ]]
        }
    });

    return novaTransacao;
};

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        await ensureSheetExists(sheets, SPREADSHEET_ID!, SHEET_NAME, HEADERS);
        
        if (req.method === 'GET') {
            const transacoes = await getTransacoes();
            res.status(200).json(transacoes);
        } else if (req.method === 'POST') {
            const novaTransacao = await addTransacao(req.body);
            res.status(201).json(novaTransacao);
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("Erro na API de Transações:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição.', details: message });
    }
}

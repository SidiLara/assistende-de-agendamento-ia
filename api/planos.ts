// api/planos.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID } from './utils/googleSheetsClient.js';
import { Plano } from '../src/servicos/gestaoPlanos';

const RANGE = 'Planos!A:C';

// Helper to convert sheet rows to Plano objects
const rowsToPlanos = (rows: any[][]): Plano[] => {
    if (!rows || rows.length < 2) return [];
    const header = rows[0];
    const data = rows.slice(1);

    const idIndex = header.indexOf('id');
    const nomeIndex = header.indexOf('nome');
    const valorIndex = header.indexOf('valor');

    return data.map(row => ({
        id: row[idIndex],
        nome: row[nomeIndex],
        valor: parseFloat(row[valorIndex]),
    }));
};

const getPlanos = async (): Promise<Plano[]> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    return rowsToPlanos(response.data.values || []);
};

const addPlano = async (planoData: Omit<Plano, 'id'>): Promise<Plano> => {
    const sheets = await getSheetsClient();
    const novoPlano: Plano = {
        id: Date.now().toString(),
        ...planoData
    };

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[novoPlano.id, novoPlano.nome, novoPlano.valor]]
        }
    });

    return novoPlano;
};


// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'GET') {
            const planos = await getPlanos();
            res.status(200).json(planos);
        } else if (req.method === 'POST') {
            const novoPlano = await addPlano(req.body);
            res.status(201).json(novoPlano);
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("Erro na API de Planos:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição.', details: message });
    }
}
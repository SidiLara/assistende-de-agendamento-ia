// api/consultores.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';
import { Consultor } from '../src/servicos/gestaoCrm';

const SHEET_NAME = 'Consultores';
const HEADERS = ['id', 'nome', 'plano', 'telefone', 'dataInicio', 'tipoPagamento', 'numeroParcelas'];
const RANGE = `${SHEET_NAME}!A:G`;

// Helper to convert sheet rows to Consultor objects
const rowsToConsultores = (rows: any[][]): Consultor[] => {
    if (!rows || rows.length < 2) return [];
    const header = rows[0];
    const data = rows.slice(1);
    
    const idIndex = header.indexOf('id');
    const nomeIndex = header.indexOf('nome');
    const planoIndex = header.indexOf('plano');
    const telefoneIndex = header.indexOf('telefone');
    const dataInicioIndex = header.indexOf('dataInicio');
    const tipoPagamentoIndex = header.indexOf('tipoPagamento');
    const numeroParcelasIndex = header.indexOf('numeroParcelas');

    return data.map(row => ({
        id: row[idIndex],
        nome: row[nomeIndex],
        plano: row[planoIndex],
        telefone: row[telefoneIndex],
        dataInicio: row[dataInicioIndex],
        tipoPagamento: row[tipoPagamentoIndex] || 'Fixo',
        numeroParcelas: row[numeroParcelasIndex] ? parseInt(row[numeroParcelasIndex], 10) : undefined,
    }));
};

const getConsultores = async (): Promise<Consultor[]> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    return rowsToConsultores(response.data.values || []);
};

const addConsultor = async (consultorData: Omit<Consultor, 'id'>): Promise<Consultor> => {
    const sheets = await getSheetsClient();
    const novoConsultor: Consultor = {
        id: Date.now().toString(),
        ...consultorData
    };

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                novoConsultor.id, novoConsultor.nome, novoConsultor.plano, 
                novoConsultor.telefone, novoConsultor.dataInicio, 
                novoConsultor.tipoPagamento, novoConsultor.numeroParcelas || ''
            ]]
        }
    });

    return novoConsultor;
};

const updateConsultor = async (consultorData: Consultor): Promise<Consultor> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    const allConsultores = rowsToConsultores(response.data.values || []);
    
    const rowIndex = allConsultores.findIndex(c => c.id === consultorData.id);
    
    if (rowIndex === -1) {
        throw new Error("Consultor não encontrado para atualização.");
    }
    
    const sheetRowNumber = rowIndex + 2;
    const updateRange = `${SHEET_NAME}!A${sheetRowNumber}:G${sheetRowNumber}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                consultorData.id, consultorData.nome, consultorData.plano, 
                consultorData.telefone, consultorData.dataInicio, 
                consultorData.tipoPagamento, consultorData.numeroParcelas || ''
            ]]
        }
    });

    return consultorData;
};


// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        await ensureSheetExists(sheets, SPREADSHEET_ID!, SHEET_NAME, HEADERS);

        if (req.method === 'GET') {
            const consultores = await getConsultores();
            res.status(200).json(consultores);
        } else if (req.method === 'POST') {
            const novoConsultor = await addConsultor(req.body);
            res.status(201).json(novoConsultor);
        } else if (req.method === 'PUT') {
            const consultorAtualizado = await updateConsultor(req.body);
            res.status(200).json(consultorAtualizado);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("Erro na API de Consultores:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição.', details: message });
    }
}

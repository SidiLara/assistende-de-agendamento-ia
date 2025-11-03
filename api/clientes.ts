// api/clientes.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';
import { Cliente } from '../src/servicos/gestaoClientes';

const SHEET_NAME = 'Clientes';
const HEADERS = ['id', 'nome', 'plano', 'telefone', 'status', 'dataInicio', 'tipoPagamento', 'numeroParcelas'];
const RANGE = `${SHEET_NAME}!A:H`;

// Helper to convert sheet rows to Cliente objects
const rowsToClientes = (rows: any[][]): Cliente[] => {
    if (!rows || rows.length < 2) return [];
    const header = rows[0];
    const data = rows.slice(1);
    
    const idIndex = header.indexOf('id');
    const nomeIndex = header.indexOf('nome');
    const planoIndex = header.indexOf('plano');
    const telefoneIndex = header.indexOf('telefone');
    const statusIndex = header.indexOf('status');
    const dataInicioIndex = header.indexOf('dataInicio');
    const tipoPagamentoIndex = header.indexOf('tipoPagamento');
    const numeroParcelasIndex = header.indexOf('numeroParcelas');

    return data.map(row => ({
        id: row[idIndex],
        nome: row[nomeIndex],
        plano: row[planoIndex],
        telefone: row[telefoneIndex],
        status: row[statusIndex],
        dataInicio: row[dataInicioIndex],
        tipoPagamento: row[tipoPagamentoIndex] || 'Fixo',
        numeroParcelas: row[numeroParcelasIndex] ? parseInt(row[numeroParcelasIndex], 10) : undefined,
    }));
};

const getClientes = async (): Promise<Cliente[]> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    return rowsToClientes(response.data.values || []);
};

const addCliente = async (clienteData: Omit<Cliente, 'id' | 'status'>): Promise<Cliente> => {
    const sheets = await getSheetsClient();
    const novoCliente: Cliente = {
        id: Date.now().toString(),
        status: 'Ativo',
        ...clienteData
    };

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                novoCliente.id, novoCliente.nome, novoCliente.plano, 
                novoCliente.telefone, novoCliente.status, novoCliente.dataInicio,
                novoCliente.tipoPagamento, novoCliente.numeroParcelas || ''
            ]]
        }
    });

    return novoCliente;
};

const updateCliente = async (clienteData: Cliente): Promise<Cliente> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    const allClientes = rowsToClientes(response.data.values || []);
    
    const rowIndex = allClientes.findIndex(c => c.id === clienteData.id);
    
    if (rowIndex === -1) {
        throw new Error("Cliente não encontrado para atualização.");
    }
    
    // Números de linha na planilha são baseados em 1, e pulamos o cabeçalho.
    const sheetRowNumber = rowIndex + 2;
    const updateRange = `${SHEET_NAME}!A${sheetRowNumber}:H${sheetRowNumber}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                clienteData.id, clienteData.nome, clienteData.plano, 
                clienteData.telefone, clienteData.status, clienteData.dataInicio,
                clienteData.tipoPagamento, clienteData.numeroParcelas || ''
            ]]
        }
    });

    return clienteData;
};


// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        await ensureSheetExists(sheets, SPREADSHEET_ID!, SHEET_NAME, HEADERS);

        if (req.method === 'GET') {
            const clientes = await getClientes();
            res.status(200).json(clientes);
        } else if (req.method === 'POST') {
            const novoCliente = await addCliente(req.body);
            res.status(201).json(novoCliente);
        } else if (req.method === 'PUT') {
            const clienteAtualizado = await updateCliente(req.body);
            res.status(200).json(clienteAtualizado);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("Erro na API de Clientes:", error);
        // Ensure error is an instance of Error to access message property
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição.', details: message });
    }
}

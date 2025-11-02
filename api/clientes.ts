import { getSheetsClient, SPREADSHEET_ID } from './utils/googleSheetsClient';
import { Cliente } from '../src/servicos/gestaoClientes';

const RANGE = 'Clientes!A:E';

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

    return data.map(row => ({
        id: row[idIndex],
        nome: row[nomeIndex],
        plano: row[planoIndex],
        telefone: row[telefoneIndex],
        status: row[statusIndex],
    }));
};

export const getClientes = async (): Promise<Cliente[]> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    return rowsToClientes(response.data.values || []);
};

export const addCliente = async (clienteData: Omit<Cliente, 'id' | 'status'>): Promise<Cliente> => {
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
            values: [[novoCliente.id, novoCliente.nome, novoCliente.plano, novoCliente.telefone, novoCliente.status]]
        }
    });

    return novoCliente;
};

export const updateCliente = async (clienteData: Cliente): Promise<Cliente> => {
    const sheets = await getSheetsClient();
    const allClientes = await getClientes();
    const rowIndex = allClientes.findIndex(c => c.id === clienteData.id);
    
    if (rowIndex === -1) {
        throw new Error("Cliente não encontrado para atualização.");
    }
    
    // In Sheets, row numbers are 1-based, and we skip the header.
    const sheetRowNumber = rowIndex + 2;
    const updateRange = `Clientes!A${sheetRowNumber}:E${sheetRowNumber}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[clienteData.id, clienteData.nome, clienteData.plano, clienteData.telefone, clienteData.status]]
        }
    });

    return clienteData;
};
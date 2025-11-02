import { getSheetsClient, SPREADSHEET_ID } from './utils/googleSheetsClient';
import { Consultor } from '../src/servicos/gestaoCrm';

const RANGE = 'Consultores!A:D';

// Helper to convert sheet rows to Consultor objects
const rowsToConsultores = (rows: any[][]): Consultor[] => {
    if (!rows || rows.length < 2) return [];
    const header = rows[0];
    const data = rows.slice(1);
    
    const idIndex = header.indexOf('id');
    const nomeIndex = header.indexOf('nome');
    const planoIndex = header.indexOf('plano');
    const telefoneIndex = header.indexOf('telefone');

    return data.map(row => ({
        id: row[idIndex],
        nome: row[nomeIndex],
        plano: row[planoIndex],
        telefone: row[telefoneIndex],
    }));
};

export const getConsultores = async (): Promise<Consultor[]> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    return rowsToConsultores(response.data.values || []);
};

export const addConsultor = async (consultorData: Omit<Consultor, 'id'>): Promise<Consultor> => {
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
            values: [[novoConsultor.id, novoConsultor.nome, novoConsultor.plano, novoConsultor.telefone]]
        }
    });

    return novoConsultor;
};

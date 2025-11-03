// api/usuarios.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';
import { Usuario } from '../src/servicos/autenticacao/modelos/UsuarioModel';

const SHEET_NAME = 'Usuarios';
const HEADERS = ['id', 'email', 'password', 'role'];
const RANGE = `${SHEET_NAME}!A:D`;

const rowsToUsuarios = (rows: any[][]): Usuario[] => {
    if (!rows || rows.length < 2) return [];
    const header = rows[0];
    const data = rows.slice(1);
    
    const idIndex = header.indexOf('id');
    const emailIndex = header.indexOf('email');
    const roleIndex = header.indexOf('role');

    return data.map(row => ({
        id: row[idIndex],
        email: row[emailIndex],
        role: row[roleIndex],
    }));
};

const getUsuarios = async (): Promise<Usuario[]> => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });
    return rowsToUsuarios(response.data.values || []);
};

const addUsuario = async (usuarioData: Omit<Usuario, 'id'> & { password?: string }): Promise<Usuario> => {
    const sheets = await getSheetsClient();
    const novoUsuario: Usuario & { password?: string } = {
        id: Date.now().toString(),
        ...usuarioData
    };

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[novoUsuario.id, novoUsuario.email, novoUsuario.password, novoUsuario.role]]
        }
    });

    const { password, ...userWithoutPassword } = novoUsuario;
    return userWithoutPassword;
};

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        await ensureSheetExists(sheets, SPREADSHEET_ID!, SHEET_NAME, HEADERS);

        if (req.method === 'GET') {
            const usuarios = await getUsuarios();
            res.status(200).json(usuarios);
        } else if (req.method === 'POST') {
            const novoUsuario = await addUsuario(req.body);
            res.status(201).json(novoUsuario);
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("Erro na API de Usuários:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição.', details: message });
    }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';
import { Usuario } from '../src/servicos/autenticacao/modelos/UsuarioModel';

const SHEET_NAME = 'Usuarios';
const HEADERS = ['id', 'email', 'password', 'role'];
const RANGE = `${SHEET_NAME}!A:D`;

const rowsToUsuarios = (rows: any[][]): (Usuario & { password?: string })[] => {
    if (!rows || rows.length < 2) return [];
    const header = rows[0];
    const data = rows.slice(1);
    
    const idIndex = header.indexOf('id');
    const emailIndex = header.indexOf('email');
    const passwordIndex = header.indexOf('password');
    const roleIndex = header.indexOf('role');

    return data.map(row => ({
        id: row[idIndex],
        email: row[emailIndex],
        password: row[passwordIndex],
        role: row[roleIndex],
    }));
};

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const sheets = await getSheetsClient();
        await ensureSheetExists(sheets, SPREADSHEET_ID!, SHEET_NAME, HEADERS);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Falha na requisição.', details: 'Email e senha são obrigatórios.' });
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const users = rowsToUsuarios(response.data.values || []);

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Retorna o usuário sem a senha
            const { password, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        } else {
            res.status(401).json({ error: 'Não autorizado.', details: 'Credenciais inválidas.' });
        }

    } catch (error) {
        console.error("Erro na API de Login:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição.', details: message });
    }
}

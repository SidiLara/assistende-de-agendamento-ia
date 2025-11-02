// api/utils/googleSheetsClient.ts
import { google } from 'googleapis';

// As variáveis de ambiente são injetadas pela Vercel de forma segura.
export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// A chave privada precisa de um tratamento para substituir `\n` por newlines reais.
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

let sheets: any;

export const getSheetsClient = async () => {
    if (sheets) {
        return sheets;
    }

    if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
        console.error("Variáveis de ambiente do Google Sheets não configuradas!");
        throw new Error("Credenciais do Google Sheets não encontradas.");
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: SERVICE_ACCOUNT_EMAIL,
                private_key: PRIVATE_KEY,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // Correção: Em vez de obter um cliente genérico com `auth.getClient()`,
        // passamos a instância de `GoogleAuth` diretamente. A biblioteca `googleapis`
        // gerencia a obtenção do cliente internamente, resolvendo o conflito de tipos.
        sheets = google.sheets({ version: 'v4', auth });
        
        console.log("Cliente do Google Sheets inicializado com sucesso.");
        return sheets;
    } catch (error) {
        console.error("Erro ao autenticar com a API do Google Sheets:", error);
        throw new Error("Falha na autenticação do Google Sheets.");
    }
};
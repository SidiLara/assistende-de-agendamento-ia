// api/utils/googleSheetsClient.ts
import { google } from 'googleapis';

// As variáveis de ambiente são injetadas pela Vercel de forma segura.
export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

// Lógica de sanitização robusta para a chave privada.
// Isso corrige erros comuns de cópia/cola, como aspas extras ou problemas de formatação de nova linha.
const getSanitizedPrivateKey = () => {
    let rawKey = process.env.GOOGLE_PRIVATE_KEY || '';

    // Remove aspas extras do início e do fim, se houver.
    if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
        rawKey = rawKey.substring(1, rawKey.length - 1);
    }
    
    // Substitui os literais '\\n' por caracteres de nova linha reais.
    // Esta é a principal correção para o erro 'ERR_OSSL_UNSUPPORTED'.
    return rawKey.replace(/\\n/g, '\n');
};

const PRIVATE_KEY = getSanitizedPrivateKey();

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

        sheets = google.sheets({ version: 'v4', auth });
        
        console.log("Cliente do Google Sheets inicializado com sucesso.");
        return sheets;
    } catch (error) {
        console.error("Erro ao autenticar com a API do Google Sheets:", error);
        throw new Error("Falha na autenticação do Google Sheets.");
    }
};

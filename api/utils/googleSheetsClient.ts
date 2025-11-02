// api/utils/googleSheetsClient.ts
import { google } from 'googleapis';

// A aplicação agora usará estas duas variáveis de ambiente.
export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CREDENTIALS_JSON = process.env.GOOGLE_CREDENTIALS_JSON;

let sheets: any;

export const getSheetsClient = async () => {
    if (sheets) {
        return sheets;
    }

    if (!SPREADSHEET_ID || !GOOGLE_CREDENTIALS_JSON) {
        console.error("Variáveis de ambiente GOOGLE_SHEET_ID ou GOOGLE_CREDENTIALS_JSON não configuradas!");
        throw new Error("Credenciais do Google Sheets não encontradas. Por favor, configure a variável GOOGLE_CREDENTIALS_JSON com o conteúdo completo do seu arquivo JSON de credenciais.");
    }

    try {
        // Analisa o JSON de credenciais diretamente da variável de ambiente.
        const credentials = JSON.parse(GOOGLE_CREDENTIALS_JSON);

        // Sanitiza a chave privada do JSON analisado.
        // Esta é a correção definitiva para problemas de formatação de nova linha ('\\n').
        const sanitizedPrivateKey = credentials.private_key.replace(/\\n/g, '\n');

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: credentials.client_email,
                private_key: sanitizedPrivateKey, // Usa a chave sanitizada
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        sheets = google.sheets({ version: 'v4', auth });
        
        console.log("Cliente do Google Sheets inicializado com sucesso.");
        return sheets;
    } catch (error) {
        console.error("Erro ao autenticar com a API do Google Sheets. Verifique se o conteúdo da variável GOOGLE_CREDENTIALS_JSON é um JSON válido.", error);
        throw new Error("Falha na autenticação do Google Sheets.");
    }
};

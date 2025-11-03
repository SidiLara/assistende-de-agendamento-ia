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

/**
 * Garante que uma aba (sheet) específica exista na planilha. Se não existir,
 * a cria juntamente com a linha de cabeçalho.
 * @param sheets O cliente autenticado do Google Sheets.
 * @param spreadsheetId O ID da planilha.
 * @param sheetName O nome da aba a ser verificada/criada.
 * @param headers Um array com os títulos das colunas para o cabeçalho.
 */
export const ensureSheetExists = async (sheets: any, spreadsheetId: string, sheetName: string, headers: string[]) => {
    try {
        const spreadsheetMeta = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        const sheetExists = spreadsheetMeta.data.sheets?.some(
            (s: any) => s.properties.title === sheetName
        );

        if (!sheetExists) {
            console.log(`Aba "${sheetName}" não encontrada. Criando...`);
            // Cria a aba
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [{
                        addSheet: {
                            properties: { title: sheetName },
                        },
                    }],
                },
            });

            // Adiciona os cabeçalhos à nova aba
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [headers],
                },
            });
            console.log(`Aba "${sheetName}" criada com sucesso e cabeçalhos adicionados.`);

            // Lógica especial para criar o usuário administrador padrão na primeira vez
            if (sheetName === 'Usuarios') {
                console.log('Criando usuário administrador padrão...');
                const adminUser = [
                    Date.now().toString(), // id
                    'sidineilara@gmail.com', // email
                    'Crm@Admin2024!', // senha
                    'Admin' // role
                ];
                await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: `${sheetName}!A2`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [adminUser],
                    },
                });
                console.log('Usuário administrador padrão criado com sucesso.');
            }
        }
    } catch (error) {
        console.error(`Erro ao garantir a existência da aba "${sheetName}":`, error);
        throw new Error(`Falha ao verificar ou criar a aba "${sheetName}".`);
    }
};

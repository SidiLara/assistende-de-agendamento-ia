// api/estatisticas.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';

const VENDAS_SHEET_NAME = 'Vendas';
const CLIENTES_SHEET_NAME = 'Clientes';
const CONSULTORES_SHEET_NAME = 'Consultores';
const PLANOS_SHEET_NAME = 'Planos';

const VENDAS_HEADERS = ['id', 'dataVenda', 'clienteId', 'planoId', 'consultorId', 'valor'];

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        // Garante que a planilha de vendas exista
        await ensureSheetExists(sheets, SPREADSHEET_ID!, VENDAS_SHEET_NAME, VENDAS_HEADERS);
        
        const { mes, ano } = req.query;
        const targetMonth = mes ? parseInt(mes as string) - 1 : new Date().getMonth();
        const targetYear = ano ? parseInt(ano as string) : new Date().getFullYear();

        // Busca todos os dados necessários em paralelo
        const [vendasResponse, clientesResponse, consultoresResponse, planosResponse] = await Promise.all([
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${VENDAS_SHEET_NAME}!A:F` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${CLIENTES_SHEET_NAME}!A:A` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${CONSULTORES_SHEET_NAME}!A:A` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${PLANOS_SHEET_NAME}!A:C` })
        ]);

        const vendasRows = vendasResponse.data.values || [];
        const clientesRows = clientesResponse.data.values || [];
        const consultoresRows = consultoresResponse.data.values || [];
        
        // --- Processamento e Cálculos ---

        // 1. Totais Gerais
        const totalClientes = clientesRows.length > 1 ? clientesRows.length - 1 : 0;
        const totalConsultores = consultoresRows.length > 1 ? consultoresRows.length - 1 : 0;

        // 2. Dados de Vendas do Mês
        const vendasDoMes = vendasRows.slice(1).filter((row: any[]) => {
            const dataVenda = new Date(row[1]); // Coluna 'dataVenda'
            return dataVenda.getMonth() === targetMonth && dataVenda.getFullYear() === targetYear;
        });

        // 3. Faturamento Mensal
        const faturamentoMensal = vendasDoMes.reduce((acc, row) => {
            const valor = parseFloat(row[5]); // Coluna 'valor'
            return acc + (isNaN(valor) ? 0 : valor);
        }, 0);
        
        // 4. Vendas no Mês
        const vendasNoMes = vendasDoMes.length;

        // 5. Faturamento por dia para o gráfico
        const diasNoMes = new Date(targetYear, targetMonth + 1, 0).getDate();
        const faturamentoPorDia = Array.from({ length: diasNoMes }, (_, i) => {
            const dia = i + 1;
            const vendasDoDia = vendasDoMes.filter(row => new Date(row[1]).getDate() === dia);
            const faturamento = vendasDoDia.reduce((acc, row) => acc + parseFloat(row[5]), 0);
            return {
                label: `${String(dia).padStart(2, '0')}/${String(targetMonth + 1).padStart(2, '0')}`,
                value: faturamento
            };
        });

        res.status(200).json({
            totalClientes,
            totalConsultores,
            faturamentoMensal,
            vendasNoMes,
            faturamentoPorDia
        });

    } catch (error) {
        console.error("Erro na API de Estatísticas:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição de estatísticas.', details: message });
    }
}

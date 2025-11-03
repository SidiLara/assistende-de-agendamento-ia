// api/estatisticas.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID } from './utils/googleSheetsClient.js';
import { Cliente } from '../src/servicos/gestaoClientes';
import { isPlanoAtivo } from './utils/financials.js';

const VENDAS_SHEET_NAME = 'Vendas';
const CLIENTES_SHEET_NAME = 'Clientes';
const PLANOS_SHEET_NAME = 'Planos';

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        
        const { mes, ano } = req.query;
        const targetMonth = mes ? parseInt(mes as string) - 1 : new Date().getMonth();
        const targetYear = ano ? parseInt(ano as string) : new Date().getFullYear();

        const [vendasResponse, clientesResponse, planosResponse] = await Promise.all([
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${VENDAS_SHEET_NAME}!A:F` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${CLIENTES_SHEET_NAME}!A:I` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${PLANOS_SHEET_NAME}!A:C` })
        ]);

        const vendasRows = vendasResponse.data.values || [];
        const clientesRows = clientesResponse.data.values || [];
        const planosRows = planosResponse.data.values || [];
        
        const clientes: Cliente[] = clientesRows.length > 1 ? clientesRows.slice(1).map((row: any[]) => ({ id: row[0], nome: row[1], plano: row[2], telefone: row[3], status: row[4], dataInicio: row[5], tipoPagamento: row[6] || 'Fixo', numeroParcelas: row[7] ? parseInt(row[7]) : undefined, tipo: row[8] || 'Cliente' })) : [];

        const totalClientes = clientes.filter(c => c.tipo === 'Cliente').length;
        const totalConsultores = clientes.filter(c => c.tipo === 'Consultor').length;

        const planosMap: Map<string, number> = new Map(planosRows.slice(1).map((row: any[]) => [row[1], parseFloat(row[2])]));

        let faturamentoMensal = 0;
        clientes.forEach(entidade => {
            if (isPlanoAtivo(entidade, targetMonth, targetYear)) {
                const nomePlanoCompleto = `Plano ${entidade.plano}`;
                const valorPlano = planosMap.get(nomePlanoCompleto) || 0;
                faturamentoMensal += valorPlano;
            }
        });

        const vendasDoMes = vendasRows.slice(1).filter((row: any[]) => {
            if (!row[1]) return false;
            const dataVenda = new Date(row[1]);
            return dataVenda.getMonth() === targetMonth && dataVenda.getFullYear() === targetYear;
        });
        const vendasNoMes = vendasDoMes.length;

        const diasNoMes = new Date(targetYear, targetMonth + 1, 0).getDate();
        const faturamentoPorDia = Array.from({ length: diasNoMes }, (_, i) => {
            const dia = i + 1;
            const vendasDoDia = vendasDoMes.filter((row: any[]) => new Date(row[1]).getDate() === dia);
            const faturamento = vendasDoDia.reduce((acc: number, row: any[]) => acc + (parseFloat(row[5]) || 0), 0);
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
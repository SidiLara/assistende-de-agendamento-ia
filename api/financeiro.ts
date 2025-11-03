// api/financeiro.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID } from './utils/googleSheetsClient.js';
import { Cliente } from '../src/servicos/gestaoClientes';
import { isPlanoAtivo } from './utils/financials.js';

const CLIENTES_SHEET_NAME = 'Clientes';
const PLANOS_SHEET_NAME = 'Planos';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        const targetMonth = new Date().getMonth();
        const targetYear = new Date().getFullYear();

        const [clientesResponse, planosResponse] = await Promise.all([
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${CLIENTES_SHEET_NAME}!A:I` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${PLANOS_SHEET_NAME}!A:C` })
        ]);

        const clientesRows = clientesResponse.data.values || [];
        const planosRows = planosResponse.data.values || [];

        const planosMap: Map<string, number> = new Map(planosRows.length > 1 ? planosRows.slice(1).map((row: any[]) => [row[1], parseFloat(row[2])]) : []);

        const entidades: Cliente[] = clientesRows.length > 1 ? clientesRows.slice(1).map((row: any[]) => ({
            id: row[0],
            nome: row[1],
            plano: row[2],
            telefone: row[3],
            status: row[4],
            dataInicio: row[5],
            tipoPagamento: row[6] || 'Fixo',
            numeroParcelas: row[7] ? parseInt(row[7]) : undefined,
            tipo: row[8] || 'Cliente'
        })) : [];

        let receitaTotal = 0;
        let assinaturasAtivas = 0;
        const receitaPorEntidade = [];

        for (const entidade of entidades) {
            const nomePlanoCompleto = `Plano ${entidade.plano}`;
            const valorPlano = planosMap.get(nomePlanoCompleto) || 0;

            if (isPlanoAtivo(entidade, targetMonth, targetYear)) {
                receitaTotal += valorPlano;
                assinaturasAtivas++;
                 receitaPorEntidade.push({
                    id: entidade.id,
                    nome: entidade.nome,
                    tipo: entidade.tipo,
                    plano: nomePlanoCompleto,
                    valorPlano: valorPlano,
                    status: entidade.status,
                });
            }
        }
        
        res.status(200).json({
            receitaTotal,
            assinaturasAtivas,
            receitaPorEntidade
        });

    } catch (error) {
        console.error("Erro na API Financeiro:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição financeira.', details: message });
    }
}

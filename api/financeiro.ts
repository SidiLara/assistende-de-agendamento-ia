// api/financeiro.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';
import { Cliente } from '../src/servicos/gestaoClientes';
import { RelatorioFinanceiro, EntidadeFinanceira } from '../src/servicos/financeiro';
import { isPlanoAtivo } from './utils/financials.js';

const CLIENTES_SHEET_NAME = 'Clientes';
const PLANOS_SHEET_NAME = 'Planos';

const CLIENTES_HEADERS = ['id', 'nome', 'plano', 'telefone', 'status', 'dataInicio', 'tipoPagamento', 'numeroParcelas', 'tipo'];
const PLANOS_HEADERS = ['id', 'nome', 'valor'];

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        await ensureSheetExists(sheets, SPREADSHEET_ID!, CLIENTES_SHEET_NAME, CLIENTES_HEADERS);
        await ensureSheetExists(sheets, SPREADSHEET_ID!, PLANOS_SHEET_NAME, PLANOS_HEADERS);

        const { mes, ano } = req.query;
        const targetMonth = mes ? parseInt(mes as string) - 1 : new Date().getMonth();
        const targetYear = ano ? parseInt(ano as string) : new Date().getFullYear();

        const [clientesResponse, planosResponse] = await Promise.all([
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${CLIENTES_SHEET_NAME}!A:I` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${PLANOS_SHEET_NAME}!A:C` })
        ]);

        const clientesRows = clientesResponse.data.values || [];
        const planosRows = planosResponse.data.values || [];

        const clientes: Cliente[] = clientesRows.length > 1 ? clientesRows.slice(1).map((row: any[]) => ({ id: row[0], nome: row[1], plano: row[2], telefone: row[3], status: row[4], dataInicio: row[5], tipoPagamento: row[6] || 'Fixo', numeroParcelas: row[7] ? parseInt(row[7]) : undefined, tipo: row[8] || 'Cliente' })) : [];
        const planosMap: Map<string, number> = new Map(planosRows.slice(1).map((row: any[]) => [row[1], parseFloat(row[2])]));

        let receitaTotal = 0;
        let assinaturasAtivas = 0;
        const receitaPorEntidade: EntidadeFinanceira[] = [];

        clientes.forEach(entidade => {
            const nomePlanoCompleto = `Plano ${entidade.plano}`;
            const valorPlano = planosMap.get(nomePlanoCompleto) || 0;
            const ativoEsteMes = isPlanoAtivo(entidade, targetMonth, targetYear);
            
            receitaPorEntidade.push({
                id: entidade.id,
                nome: entidade.nome,
                tipo: entidade.tipo,
                plano: nomePlanoCompleto,
                valorPlano: valorPlano,
                status: ativoEsteMes ? 'Ativo' : 'Inativo',
            });

            if (ativoEsteMes) {
                receitaTotal += valorPlano;
                assinaturasAtivas++;
            }
        });

        const relatorio: RelatorioFinanceiro = {
            receitaTotal,
            assinaturasAtivas,
            receitaPorEntidade
        };

        res.status(200).json(relatorio);

    } catch (error) {
        console.error("Erro na API Financeira:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição financeira.', details: message });
    }
}

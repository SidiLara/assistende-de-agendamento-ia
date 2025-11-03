// api/estatisticas.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';
import { Cliente } from '../src/servicos/gestaoClientes';
import { Consultor } from '../src/servicos/gestaoCrm';

const VENDAS_SHEET_NAME = 'Vendas';
const CLIENTES_SHEET_NAME = 'Clientes';
const CONSULTORES_SHEET_NAME = 'Consultores';
const PLANOS_SHEET_NAME = 'Planos';
const VENDAS_HEADERS = ['id', 'dataVenda', 'clienteId', 'planoId', 'consultorId', 'valor'];

// Helper para verificar se um plano está ativo em um determinado mês/ano
const isPlanoAtivo = (entidade: Cliente | Consultor, targetMonth: number, targetYear: number): boolean => {
    if (!entidade.dataInicio || (entidade as Cliente).status === 'Inativo') {
        return false;
    }

    const dataInicio = new Date(entidade.dataInicio + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso
    const inicioAno = dataInicio.getFullYear();
    const inicioMes = dataInicio.getMonth();

    // Se o plano começou depois do mês alvo, não está ativo
    if (inicioAno > targetYear || (inicioAno === targetYear && inicioMes > targetMonth)) {
        return false;
    }

    if (entidade.tipoPagamento === 'Fixo') {
        return true; // Se é fixo, está sempre ativo após a data de início
    }

    if (entidade.tipoPagamento === 'Parcelado' && entidade.numeroParcelas) {
        const dataFim = new Date(dataInicio);
        dataFim.setMonth(dataInicio.getMonth() + entidade.numeroParcelas);
        
        const fimAno = dataFim.getFullYear();
        const fimMes = dataFim.getMonth();
        
        // Se o mês alvo for anterior ao fim do plano, está ativo
        return targetYear < fimAno || (targetYear === fimAno && targetMonth < fimMes);
    }

    return false;
};

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const sheets = await getSheetsClient();
        await ensureSheetExists(sheets, SPREADSHEET_ID!, VENDAS_SHEET_NAME, VENDAS_HEADERS);
        
        const { mes, ano } = req.query;
        const targetMonth = mes ? parseInt(mes as string) - 1 : new Date().getMonth();
        const targetYear = ano ? parseInt(ano as string) : new Date().getFullYear();

        const [vendasResponse, clientesResponse, consultoresResponse, planosResponse] = await Promise.all([
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${VENDAS_SHEET_NAME}!A:F` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${CLIENTES_SHEET_NAME}!A:H` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${CONSULTORES_SHEET_NAME}!A:G` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${PLANOS_SHEET_NAME}!A:C` })
        ]);

        const vendasRows = vendasResponse.data.values || [];
        const clientesRows = clientesResponse.data.values || [];
        const consultoresRows = consultoresResponse.data.values || [];
        const planosRows = planosResponse.data.values || [];

        const totalClientes = clientesRows.length > 1 ? clientesRows.length - 1 : 0;
        const totalConsultores = consultoresRows.length > 1 ? consultoresRows.length - 1 : 0;

        const planosMap: Map<string, number> = new Map(planosRows.slice(1).map((row: any[]) => [row[1], parseFloat(row[2])])); // Mapeia nome do plano para valor

        const clientes: Cliente[] = clientesRows.slice(1).map((row: any[]) => ({ id: row[0], nome: row[1], plano: row[2], telefone: row[3], status: row[4], dataInicio: row[5], tipoPagamento: row[6] || 'Fixo', numeroParcelas: row[7] ? parseInt(row[7]) : undefined }));
        const consultores: Consultor[] = consultoresRows.slice(1).map((row: any[]) => ({ id: row[0], nome: row[1], plano: row[2], telefone: row[3], dataInicio: row[4], tipoPagamento: row[5] || 'Fixo', numeroParcelas: row[6] ? parseInt(row[6]) : undefined }));
        
        let faturamentoMensal = 0;
        [...clientes, ...consultores].forEach(entidade => {
            if (isPlanoAtivo(entidade, targetMonth, targetYear)) {
                const nomePlanoCompleto = `Plano ${entidade.plano}`;
                const valorPlano = planosMap.get(nomePlanoCompleto) || 0;
                faturamentoMensal += valorPlano;
            }
        });

        const vendasDoMes = vendasRows.slice(1).filter((row: any[]) => {
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
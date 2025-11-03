import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient, SPREADSHEET_ID, ensureSheetExists } from './utils/googleSheetsClient.js';
import { Cliente } from '../src/servicos/gestaoClientes/modelos/ClienteModel';

const CLIENTES_SHEET_NAME = 'Clientes';
const VENDAS_SHEET_NAME = 'Vendas';
const CLIENTES_HEADERS = ['id', 'nome', 'plano', 'telefone', 'status', 'dataInicio', 'tipoPagamento', 'numeroParcelas'];
const VENDAS_HEADERS = ['id', 'dataVenda', 'clienteId', 'planoId', 'consultorId', 'valor'];

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { clienteId } = req.query;

        if (!clienteId || typeof clienteId !== 'string') {
            return res.status(400).json({ error: 'ID do cliente é obrigatório.' });
        }

        const sheets = await getSheetsClient();
        // Garantir que as abas existem
        await ensureSheetExists(sheets, SPREADSHEET_ID!, CLIENTES_SHEET_NAME, CLIENTES_HEADERS);
        await ensureSheetExists(sheets, SPREADSHEET_ID!, VENDAS_SHEET_NAME, VENDAS_HEADERS);

        const [clientesResponse, vendasResponse] = await Promise.all([
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${CLIENTES_SHEET_NAME}!A:H` }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${VENDAS_SHEET_NAME}!A:F` })
        ]);

        const clientesRows = clientesResponse.data.values || [];
        const vendasRows = vendasResponse.data.values || [];
        
        // Encontrar o cliente
        const clienteRow = clientesRows.find(row => row[0] === clienteId);
        if (!clienteRow) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }
        
        const cliente: Cliente = {
            id: clienteRow[0],
            nome: clienteRow[1],
            plano: clienteRow[2],
            telefone: clienteRow[3],
            status: clienteRow[4],
            dataInicio: clienteRow[5],
            tipoPagamento: clienteRow[6] || 'Fixo',
            numeroParcelas: clienteRow[7] ? parseInt(clienteRow[7]) : undefined
        };
        
        // Filtrar vendas do cliente
        const vendasCliente = vendasRows.filter(row => row[2] === clienteId);
        const totalVendas = vendasCliente.length;
        const valorTotalGasto = vendasCliente.reduce((acc, row) => acc + (parseFloat(row[5]) || 0), 0);
        
        const resumo = {
            cliente,
            estatisticas: {
                totalVendas,
                valorTotalGasto,
                ultimaCompra: vendasCliente.length > 0 ? vendasCliente[vendasCliente.length-1][1] : null
            }
        };

        res.status(200).json(resumo);

    } catch (error) {
        console.error("Erro na API de Resumo de Cliente:", error);
        const message = error instanceof Error ? error.message : 'Um erro interno ocorreu.';
        res.status(500).json({ error: 'Falha ao processar a requisição de resumo.', details: message });
    }
}

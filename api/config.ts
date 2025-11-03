// api/config.ts
// Esta é uma Vercel Serverless Function.
// Ela será responsável por responder a requisições em /api/config

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configuracoes } from '../src/servicos/configuracoes';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Extrai o 'id' dos parâmetros da URL.
  // Exemplo: /api/config?id=site-principal-italo
  const { id } = request.query;

  // Valida se o 'id' foi fornecido e é uma string.
  if (typeof id !== 'string' || !id) {
    return response.status(400).json({ error: 'O parâmetro "id" é obrigatório.' });
  }

  // Busca a configuração usando o ID fornecido (em minúsculas para ser case-insensitive).
  const config = configuracoes[id.toLowerCase()];

  // Se a configuração for encontrada, retorna como JSON com status 200 (OK).
  if (config) {
    // Adiciona headers de CORS para permitir que o front-end chame esta API
    // em ambiente de desenvolvimento e produção.
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return response.status(200).json(config);
  }

  // Se nenhuma configuração for encontrada para o ID, retorna um erro 404 (Not Found).
  return response.status(404).json({ error: `Configuração não encontrada para o id: ${id}` });
}

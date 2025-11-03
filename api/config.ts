// api/config.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
// CORREÇÃO: Importando as configurações do mesmo diretório da API.
import { configuracoes } from './configuracoes';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Extrai o parâmetro 'id' da query string da URL.
  const { id } = request.query;

  // Se nenhum ID for fornecido ou se não for uma string, retorna um erro.
  if (typeof id !== 'string' || !id) {
    return response.status(400).json({ error: 'ID de configuração inválido ou não fornecido.' });
  }

  // Busca a configuração correspondente ao ID fornecido no nosso "banco de dados".
  const config = configuracoes[id];

  // Se nenhuma configuração for encontrada para o ID, retorna um erro 404 (Não Encontrado).
  if (!config) {
    return response.status(404).json({ error: `Configuração com ID '${id}' não encontrada.` });
  }

  // Se a configuração for encontrada, retorna com sucesso (status 200) em formato JSON.
  return response.status(200).json(config);
}

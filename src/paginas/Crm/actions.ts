import { api } from '../api';

export const adicionarAssistente = async (assistente: { nome: string; prompt: string }) => {
  const response = await api.post('/assistentes', assistente);
  return response.data;
};
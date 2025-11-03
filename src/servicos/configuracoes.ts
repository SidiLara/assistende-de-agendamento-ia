/* eslint-disable prettier/prettier */
// src/servicos/configuracoes.ts

/**
 * Interface que define a estrutura de um objeto de configuração do chat.
 * Cada configuração representa um "link" de acesso único.
 */
export interface ChatConfig {
  consultor: string;    // O nome do consultor associado a este link.
  assistente: string;   // O nome que o assistente de IA usará.
  webhook: string;      // A URL do webhook para enviar os dados do lead.
}

/**
 * Objeto que mapeia um ID de configuração (usado na URL, ex: ?id=SITE_PRINCIPAL_ITALO)
 * para o objeto de configuração completo.
 *
 * Este é o "banco de dados" centralizado. Para criar um novo link,
 * basta adicionar uma nova entrada a este objeto.
 */
export const configuracoes: Record<string, ChatConfig> = {
  // Configuração Padrão para Sidinei Lara (quando nenhum ID é fornecido)
  'default': {
    consultor: 'Sidinei Lara',
    assistente: 'Yannis',
    webhook: 'https://hook.us2.make.com/ud4aq9lrms2mfpce40ur6ac1papv68fi',
  },
  'site-principal-italo': {
    consultor: 'Italo',
    assistente: 'Yannis',
    webhook: '1iqcj1yt537oikvm9w93i2fv3db4x9k4',
  },
  // EXEMPLO: Novo link para um consultor diferente e uma campanha diferente.
  // URL: https://neural-chat-ia.vercel.app/?id=campanha-imoveis-joao
  'campanha-imoveis-joao': {
    consultor: 'Joao',
    assistente: 'Sofia',
    webhook: 'SEU_NOVO_WEBHOOK_AQUI_123456',
  },
};

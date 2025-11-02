// src/utils/apiErrorHandler.ts

export const getFriendlyApiError = (error: unknown, resourceName: string): string => {
    const baseMessage = `Não foi possível carregar ${resourceName}. `;
    
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('accessnotconfigured') || errorMessage.includes('api has not been used')) {
            return baseMessage + "A API do Google Sheets não está ativada. Por favor, habilite-a no seu projeto do Google Cloud e aguarde alguns minutos antes de tentar novamente.";
        }
        if (errorMessage.includes('not found')) {
            return baseMessage + "A planilha ou aba não foi encontrada. Verifique se o ID da planilha está correto e se as abas ('Consultores', 'Clientes', 'Planos') existem.";
        }
        if (errorMessage.includes('permission denied')) {
            return baseMessage + "Permissão negada. Verifique se o e-mail da conta de serviço foi compartilhado com a planilha do Google Sheets e possui permissões de Editor.";
        }
        if (errorMessage.includes('credentials')) {
            return baseMessage + "Ocorreu um erro com as credenciais. Verifique se as variáveis de ambiente GOOGLE_SHEET_ID e GOOGLE_CREDENTIALS_JSON estão configuradas corretamente.";
        }
    }
    
    return baseMessage + "Ocorreu um erro inesperado. Verifique sua conexão com a internet e as configurações da API.";
};

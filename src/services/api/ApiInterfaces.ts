export interface ServicoDeApi {
    analisarConteudo(prompt: string, maxRetries?: number): Promise<any>;
}

export interface ServicoDeCrm {
    enviarLead(leadData: any, webhookId: string): Promise<any>;
}

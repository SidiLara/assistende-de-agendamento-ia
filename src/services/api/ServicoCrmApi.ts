import { ServicoDeCrm } from './ApiInterfaces';

export class ServicoCrmApi implements ServicoDeCrm {
    private getWebhookUrl(webhookId: string): string {
        return `https://connect.make.com/${webhookId}`;
    }

    async enviarLead(leadData: any, webhookId: string): Promise<any> {
        const url = this.getWebhookUrl(webhookId);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData),
            });

            if (!response.ok) {
                throw new Error(`Erro ao enviar lead: ${response.statusText}`);
            }

            console.log('Lead enviado com sucesso para o Make.com');
            return { success: true, message: 'Lead enviado com sucesso' };

        } catch (error) {
            console.error('Falha ao enviar lead para o Make.com:', error);
            throw new Error('Falha ao enviar lead');
        }
    }
}

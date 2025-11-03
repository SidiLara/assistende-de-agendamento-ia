import { Lead } from "../chat/modelos/LeadModel";
import { ConfiguracaoChat } from "../chat/modelos/ConfiguracaoChatModel";
import { ICrmApiService } from "./InterfacesApi";

const BASE_MAKE_URL = "https://hook.us2.make.com/";

export class ServicoCrmApi implements ICrmApiService {
    
    private getLeadCounter(): number {
        let leadCounter = 1;
        try {
            const storedCounter = localStorage.getItem('leadCounter');
            if (storedCounter) {
                leadCounter = parseInt(storedCounter, 10);
            }
            localStorage.setItem('leadCounter', (leadCounter + 1).toString());
        } catch (e) {
            console.error("Não foi possível acessar o localStorage para o contador de leads", e);
        }
        return leadCounter;
    }

    public async sendLead(leadData: Partial<Lead>, narrativeReport: string, config: ConfiguracaoChat): Promise<void> {
        const { webhookId, consultantName } = config;
        const MAKE_URL = `${BASE_MAKE_URL}${webhookId}`;
        const currentLeadNumber = this.getLeadCounter();

        const { clientName, clientWhatsapp, clientEmail, topic, creditAmount = 0, monthlyInvestment = 0, startDatetime, source, finalSummary, meetingType } = leadData;
        
        const formattedCreditAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creditAmount);
        const formattedMonthlyInvestment = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyInvestment);

        let notesContent = `Lead: ${currentLeadNumber}\n\n`;
        notesContent += "RELATÓRIO DA CONVERSA (IA):\n";
        notesContent += `${narrativeReport}\n\n`;
        notesContent += "--------------------------------------\n\n";
        notesContent += "DADOS CAPTURADOS:\n";
        notesContent += `Origem: ${source || 'Direto'}\n`;
        notesContent += `Nome do Cliente: ${clientName}\n`;
        notesContent += `WhatsApp: ${clientWhatsapp || 'Não informado'}\n`;
        notesContent += `E-mail: ${clientEmail || 'Não informado'}\n`;
        notesContent += `Objetivo do Projeto: ${topic}\n`;
        notesContent += `Valor do Crédito: ${formattedCreditAmount}\n`;
        notesContent += `Reserva Mensal: ${formattedMonthlyInvestment}\n`;
        notesContent += `Agendamento Preferencial: ${startDatetime || 'Não informado'}\n\n`;
        
        if (startDatetime) {
            const timeMatch = startDatetime.match(/\b(\d{1,2}):(\d{2})\b/);
            if (timeMatch) {
                const hour = parseInt(timeMatch[1], 10);
                if (hour < 6 || hour >= 22) {
                    notesContent += "ATENÇÃO: Horário de agendamento fora do padrão comercial. Recomenda-se ligar para confirmar.\n";
                }
            }
        }

        const requestBody = {
            nome: clientName,
            email: clientEmail || 'nao-informado@lead.com',
            celular: (clientWhatsapp || '').replace(/\D/g, ''),
            cpf_ou_cnpj: "000.000.000-00",
            classificacao1: `Projeto: ${topic}`,
            classificacao2: `${formattedCreditAmount}`,
            classificacao3: `Reserva Mensal: ${formattedMonthlyInvestment}`,
            obs: notesContent,
            platform: "GEMSID",
            consultantName,
            final_summary: finalSummary,
            start_datetime: startDatetime,
            meeting_type: meetingType,
        };

        try {
            const response = await fetch(MAKE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            console.log("Lead enviado para o CRM:", requestBody);
            if (!response.ok) {
                console.error("Erro na resposta do CRM:", response.status, response.statusText);
                const responseBody = await response.text();
                console.error("Corpo da resposta do CRM:", responseBody);
                throw new Error(`Falha no envio ao CRM com status: ${response.status}`);
            }
        } catch (error) {
            console.error("Erro ao enviar para o CRM:", error);
            throw error;
        }
    }
}

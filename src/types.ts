export enum MessageSender {
    User = 'user',
    Bot = 'bot',
}

export interface Message {
    id: number;
    sender: MessageSender;
    text: string;
}

export interface LeadData {
    client_name: string;
    topic: 'Imóvel' | 'Automóvel' | 'Investimento' | 'Viagem' | 'Outro';
    valor_credito: number;
    reserva_mensal: number;
    client_whatsapp: string;
    client_email: string;
    meeting_type: 'Videochamada' | 'Presencial';
    start_datetime: string;
    final_summary?: string;
    source?: string;
}

export type LeadDataKey = keyof LeadData;
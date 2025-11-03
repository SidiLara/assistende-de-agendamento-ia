export interface Lead {
    clientName: string;
    topic: 'Imóvel' | 'Automóvel' | 'Investimento' | 'Viagem' | 'Outro';
    creditAmount: number;
    monthlyInvestment: number;
    clientWhatsapp: string;
    clientEmail: string;
    meetingType: 'Videochamada' | 'Presencial';
    startDatetime: string;
    finalSummary?: string;
    source?: string;
}

export type LeadKey = keyof Lead;
import * as React from 'react';

export interface AcaoItem {
    titulo: string;
    linkPara: string;
    icone: React.ReactNode;
}

export interface DashboardDeAcoesProps {
    acoes: AcaoItem[];
}

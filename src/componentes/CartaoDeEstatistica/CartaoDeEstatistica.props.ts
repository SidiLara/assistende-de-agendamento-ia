import * as React from 'react';

export interface CartaoDeEstatisticaProps {
    titulo: string;
    valor: string;
    icone: React.ReactNode;
    mudanca?: string;
    corMudanca?: 'positivo' | 'negativo';
}

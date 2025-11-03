export interface FaturamentoDiario {
    label: string;
    value: number;
}

export interface EstatisticasData {
    totalClientes: number;
    totalConsultores: number;
    faturamentoMensal: number;
    vendasNoMes: number;
    faturamentoPorDia: FaturamentoDiario[];
}

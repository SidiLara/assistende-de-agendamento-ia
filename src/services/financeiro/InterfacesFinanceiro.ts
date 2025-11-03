import { RelatorioFinanceiro } from "./modelos/FinanceiroModel";

export interface IServicoFinanceiro {
    getRelatorioFinanceiro(mes: number, ano: number): Promise<RelatorioFinanceiro>;
}

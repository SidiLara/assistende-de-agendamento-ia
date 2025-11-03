import { RelatorioFinanceiro } from "./modelos/FinanceiroModel";

export interface IServicoFinanceiro {
    getRelatorioFinanceiro(): Promise<RelatorioFinanceiro>;
}

import { RelatorioFinanceiro } from "./modelos/FinanceiroModel";
import { IServicoFinanceiro } from "./InterfacesFinanceiro";

const API_BASE_URL = '/api/financeiro';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export class ServicoFinanceiro implements IServicoFinanceiro {
    public async getRelatorioFinanceiro(mes: number, ano: number): Promise<RelatorioFinanceiro> {
        const response = await fetch(`${API_BASE_URL}?mes=${mes}&ano=${ano}`);
        return handleResponse(response);
    }
}

import { EstatisticasData } from "./modelos/EstatisticasModel";
import { IServicoEstatisticas } from "./InterfacesEstatisticas";

const API_BASE_URL = '/api/estatisticas';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export class ServicoEstatisticas implements IServicoEstatisticas {
    public async getEstatisticas(mes: number, ano: number): Promise<EstatisticasData> {
        const response = await fetch(`${API_BASE_URL}?mes=${mes}&ano=${ano}`);
        return handleResponse(response);
    }
}

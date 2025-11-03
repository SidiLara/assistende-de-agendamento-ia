import { EstatisticasData } from "./modelos/EstatisticasModel";

export interface IServicoEstatisticas {
    getEstatisticas(mes: number, ano: number): Promise<EstatisticasData>;
}

import { Consultor } from "./modelos/ConsultorModel";

export interface IServicoGestaoCrm {
    getConsultores(): Promise<Consultor[]>;
}

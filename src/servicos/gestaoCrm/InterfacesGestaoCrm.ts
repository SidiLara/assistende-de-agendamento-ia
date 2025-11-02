import { Consultor } from "./modelos/ConsultorModel";

export interface IServicoGestaoCrm {
    getConsultores(): Promise<Consultor[]>;
    addConsultor(consultor: Omit<Consultor, 'id'>): Promise<Consultor>;
}
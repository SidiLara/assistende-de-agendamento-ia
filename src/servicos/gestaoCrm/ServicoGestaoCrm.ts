import { Consultor } from "./modelos/ConsultorModel";
import { IServicoGestaoCrm } from "./InterfacesGestaoCrm";
import { addConsultor, getConsultores } from "../../../api/consultores";

export class ServicoGestaoCrm implements IServicoGestaoCrm {
    public async getConsultores(): Promise<Consultor[]> {
        return getConsultores();
    }

    public async addConsultor(consultorData: Omit<Consultor, 'id'>): Promise<Consultor> {
        return addConsultor(consultorData);
    }
}
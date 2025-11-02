import { Plano } from "./modelos/PlanoModel";
import { IServicoGestaoPlanos } from "./InterfacesGestaoPlanos";
import { getPlanos, addPlano } from "../../../api/planos";

export class ServicoGestaoPlanos implements IServicoGestaoPlanos {
    public async getPlanos(): Promise<Plano[]> {
        return getPlanos();
    }

    public async addPlano(planoData: Omit<Plano, 'id'>): Promise<Plano> {
        return addPlano(planoData);
    }
}
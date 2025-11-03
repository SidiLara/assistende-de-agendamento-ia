import { Plano } from "./modelos/PlanoModel";

export interface IServicoGestaoPlanos {
    getPlanos(): Promise<Plano[]>;
    addPlano(plano: Omit<Plano, 'id'>): Promise<Plano>;
}
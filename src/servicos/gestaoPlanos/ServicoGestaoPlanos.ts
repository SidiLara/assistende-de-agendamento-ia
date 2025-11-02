import { Plano } from "./modelos/PlanoModel";
import { IServicoGestaoPlanos } from "./InterfacesGestaoPlanos";

const mockPlanos: Plano[] = [
    { id: 'p1', nome: 'Plano Básico Mensal', valor: 49.90 },
    { id: 'p2', nome: 'Plano Premium Mensal', valor: 99.90 },
    { id: 'p3', nome: 'Plano Empresarial Anual', valor: 999.00 },
];

export class ServicoGestaoPlanos implements IServicoGestaoPlanos {
    public async getPlanos(): Promise<Plano[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...mockPlanos]); 
            }, 500);
        });
    }

    public async addPlano(planoData: Omit<Plano, 'id'>): Promise<Plano> {
        return new Promise(resolve => {
            setTimeout(() => {
                const novoPlano: Plano = {
                    id: Date.now().toString(),
                    ...planoData
                };
                mockPlanos.push(novoPlano);
                resolve(novoPlano);
            }, 300);
        });
    }
}
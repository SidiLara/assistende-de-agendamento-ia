import { Plano } from "./modelos/PlanoModel";
import { IServicoGestaoPlanos } from "./InterfacesGestaoPlanos";

const mockPlanos: Plano[] = [
    { id: '1', nome: 'Plano Básico', valor: 99.90 },
    { id: '2', nome: 'Plano Premium', valor: 199.90 },
    { id: '3', nome: 'Plano Empresarial', valor: 499.90 },
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

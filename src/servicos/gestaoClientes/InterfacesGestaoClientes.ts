import { Cliente } from "./modelos/ClienteModel";

export interface IServicoGestaoClientes {
    getClientes(): Promise<Cliente[]>;
    addCliente(cliente: Omit<Cliente, 'id' | 'status'>): Promise<Cliente>;
    updateCliente(cliente: Cliente): Promise<Cliente>;
}

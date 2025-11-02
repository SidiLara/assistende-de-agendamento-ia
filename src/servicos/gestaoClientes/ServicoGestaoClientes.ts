import { Cliente } from "./modelos/ClienteModel";
import { IServicoGestaoClientes } from "./InterfacesGestaoClientes";
import { getClientes, addCliente, updateCliente } from "../../../api/clientes";

export class ServicoGestaoClientes implements IServicoGestaoClientes {
    public async getClientes(): Promise<Cliente[]> {
        return getClientes();
    }

    public async addCliente(clienteData: Omit<Cliente, 'id' | 'status'>): Promise<Cliente> {
        return addCliente(clienteData);
    }

    public async updateCliente(clienteData: Cliente): Promise<Cliente> {
       return updateCliente(clienteData);
    }
}
import { Cliente } from "./modelos/ClienteModel";

export interface IServicoGestaoClientes {
    getClientes(): Promise<Cliente[]>;
    // Poderia ter mais métodos como addCliente, updateCliente, etc.
}

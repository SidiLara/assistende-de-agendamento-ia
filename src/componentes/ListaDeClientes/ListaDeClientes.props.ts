import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";

export interface ListaDeClientesProps {
    clientes: Cliente[];
    onEditar: (cliente: Cliente) => void;
    onToggleStatus: (cliente: Cliente) => void;
}

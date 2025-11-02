import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";

export interface CartaoDeClienteProps {
    cliente: Cliente;
    onEditar: (cliente: Cliente) => void;
    onToggleStatus: (cliente: Cliente) => void;
}

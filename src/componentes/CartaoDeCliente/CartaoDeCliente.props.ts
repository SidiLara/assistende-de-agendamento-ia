import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";
import { Plano } from "../../servicos/gestaoPlanos";

export interface CartaoDeClienteProps {
    cliente: Cliente;
    planos: Plano[];
    onEditar: (cliente: Cliente) => void;
    onToggleStatus: (cliente: Cliente) => void;
}

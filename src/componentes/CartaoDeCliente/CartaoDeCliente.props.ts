import { Cliente } from "../../services/gestaoClientes/modelos/ClienteModel";
import { Plano } from "../../services/gestaoPlanos";

export interface CartaoDeClienteProps {
    cliente: Cliente;
    planos: Plano[];
    onEditar: (cliente: Cliente) => void;
}

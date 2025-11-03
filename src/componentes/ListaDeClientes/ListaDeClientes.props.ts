import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";
import { Plano } from "../../servicos/gestaoPlanos";

export interface ListaDeClientesProps {
    clientes: Cliente[];
    planos: Plano[];
    onEditar: (cliente: Cliente) => void;
}

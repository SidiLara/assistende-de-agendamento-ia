import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";

export interface FormularioAdicionarClienteProps {
    onSalvar: (novoCliente: Omit<Cliente, 'id'>) => void;
    onCancelar: () => void;
}
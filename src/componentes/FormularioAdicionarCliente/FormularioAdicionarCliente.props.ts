import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";

export interface FormularioAdicionarClienteProps {
    clienteExistente?: Cliente | null;
    onSalvar: (dadosCliente: Omit<Cliente, 'id' | 'status'> | Cliente) => void;
    onCancelar: () => void;
}
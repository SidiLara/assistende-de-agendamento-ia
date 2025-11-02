import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";

export interface FormularioAdicionarClienteProps {
    clienteParaEditar?: Cliente | null;
    onSalvar: (clienteData: Omit<Cliente, 'id' | 'status'>) => void;
    onCancelar: () => void;
}

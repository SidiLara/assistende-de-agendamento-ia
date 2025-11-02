import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";

export interface FormularioClienteProps {
    clienteExistente?: Cliente | null;
    onSalvar: (dadosCliente: Omit<Cliente, 'id' | 'status'> | Cliente) => void;
    onCancelar: () => void;
}

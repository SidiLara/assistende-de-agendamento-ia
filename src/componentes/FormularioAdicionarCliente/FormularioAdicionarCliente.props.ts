import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";
import { Plano } from "../../servicos/gestaoPlanos/modelos/PlanoModel";

export interface FormularioAdicionarClienteProps {
    clienteParaEditar?: Cliente | null;
    // FIX: Added `planosDisponiveis` to the props interface to resolve the error in `Clientes.tsx`.
    planosDisponiveis: Plano[];
    onSalvar: (clienteData: Omit<Cliente, 'id' | 'status'>) => void;
    onCancelar: () => void;
}
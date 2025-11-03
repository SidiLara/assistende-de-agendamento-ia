import { Cliente } from "../../servicos/gestaoClientes/modelos/ClienteModel";
import { Plano } from "../../servicos/gestaoPlanos/modelos/PlanoModel";

export interface FormularioAdicionarClienteProps {
    clienteParaEditar?: Cliente | null;
    planosDisponiveis: Plano[];
    onSalvar: (clienteData: Omit<Cliente, 'id'>) => void;
    onCancelar: () => void;
    isSaving?: boolean;
    apiError?: string | null;
}

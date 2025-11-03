import { Consultor } from "../../servicos/gestaoCrm/modelos/ConsultorModel";
import { Plano } from "../../servicos/gestaoPlanos";

export interface FormularioAdicionarConsultorProps {
    consultorParaEditar?: Consultor | null;
    planosDisponiveis: Plano[];
    onSalvar: (novoConsultor: Omit<Consultor, 'id'>) => void;
    onCancelar: () => void;
}

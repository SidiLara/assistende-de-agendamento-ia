import { Consultor } from "../../servicos/gestaoCrm/modelos/ConsultorModel";

export interface FormularioAdicionarConsultorProps {
    onSalvar: (novoConsultor: Omit<Consultor, 'id'>) => void;
    onCancelar: () => void;
}
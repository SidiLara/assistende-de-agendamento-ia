import { Consultor } from "../../services/gestaoCrm/modelos/ConsultorModel";
import { Plano } from "../../services/gestaoPlanos";

export interface CartaoDeConsultorProps {
    consultor: Consultor;
    planos: Plano[];
    onEditar: (consultor: Consultor) => void;
}

import { Consultor } from "../../servicos/gestaoCrm/modelos/ConsultorModel";
import { Plano } from "../../servicos/gestaoPlanos";

export interface CartaoDeConsultorProps {
    consultor: Consultor;
    planos: Plano[];
    onEditar: (consultor: Consultor) => void;
}

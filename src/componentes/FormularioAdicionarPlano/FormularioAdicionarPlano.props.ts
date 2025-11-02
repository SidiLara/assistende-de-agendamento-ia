import { Plano } from "../../servicos/gestaoPlanos/modelos/PlanoModel";

export interface FormularioAdicionarPlanoProps {
    onSalvar: (novoPlano: Omit<Plano, 'id'>) => void;
    onCancelar: () => void;
}
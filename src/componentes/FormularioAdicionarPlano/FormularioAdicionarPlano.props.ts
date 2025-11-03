import { Plano } from "../../servicos/gestaoPlanos";

export interface FormularioAdicionarPlanoProps {
    onSalvar: (planoData: Omit<Plano, 'id'>) => void;
    onCancelar: () => void;
    isSaving?: boolean;
    apiError?: string | null;
}

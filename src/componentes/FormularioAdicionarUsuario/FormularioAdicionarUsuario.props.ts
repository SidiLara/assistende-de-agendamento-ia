import { Usuario } from "../../servicos/gestaoUsuarios";

export interface FormularioAdicionarUsuarioProps {
    onSalvar: (usuarioData: Omit<Usuario, 'id'> & { password?: string }) => void;
    onCancelar: () => void;
    isSaving?: boolean;
    apiError?: string | null;
}

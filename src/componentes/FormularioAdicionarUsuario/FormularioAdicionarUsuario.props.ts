import { Usuario } from "../../servicos/gestaoUsuarios";

export interface FormularioAdicionarUsuarioProps {
    onSalvar: (novoUsuario: Omit<Usuario, 'id'> & { password?: string }) => void | Promise<void>;
    onCancelar: () => void;
}
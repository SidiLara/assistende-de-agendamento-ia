import { Usuario } from "../../servicos/gestaoUsuarios/modelos/UsuarioModel";

export interface FormularioAdicionarUsuarioProps {
    onSalvar: (novoUsuario: Omit<Usuario, 'id'> & { password?: string }) => void;
    onCancelar: () => void;
}

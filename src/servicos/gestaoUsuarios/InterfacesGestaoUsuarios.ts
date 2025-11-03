import { Usuario } from "../autenticacao/modelos/UsuarioModel";

export interface IServicoGestaoUsuarios {
    getUsuarios(): Promise<Usuario[]>;
    addUsuario(usuario: Omit<Usuario, 'id'> & { password?: string }): Promise<Usuario>;
}

import { Usuario } from "./modelos/UsuarioModel";

export interface IAutenticacaoService {
    login(email: string, password: string): Promise<Usuario>;
}

import { Usuario } from "../autenticacao/modelos/UsuarioModel";
import { IServicoGestaoUsuarios } from "./InterfacesGestaoUsuarios";

const API_BASE_URL = '/api/usuarios';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export class ServicoGestaoUsuarios implements IServicoGestaoUsuarios {
    public async getUsuarios(): Promise<Usuario[]> {
        const response = await fetch(API_BASE_URL);
        return handleResponse(response);
    }

    public async addUsuario(usuarioData: Omit<Usuario, 'id'> & { password?: string }): Promise<Usuario> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuarioData),
        });
        return handleResponse(response);
    }
}

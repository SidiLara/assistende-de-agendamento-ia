import { Usuario } from "./modelos/UsuarioModel";
import { IAutenticacaoService } from "./InterfacesAutenticacao";

const API_BASE_URL = '/api/login';

export class AutenticacaoService implements IAutenticacaoService {
    public async login(email: string, password: string): Promise<Usuario> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.details || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    }
}

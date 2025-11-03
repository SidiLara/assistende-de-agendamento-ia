import { Cliente } from "./modelos/ClienteModel";
import { IServicoGestaoClientes } from "./InterfacesGestaoClientes";

const API_BASE_URL = '/api/clientes';

// Helper to handle fetch responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export class ServicoGestaoClientes implements IServicoGestaoClientes {
    public async getClientes(): Promise<Cliente[]> {
        const response = await fetch(API_BASE_URL);
        return handleResponse(response);
    }

    public async addCliente(clienteData: Omit<Cliente, 'id' | 'status'>): Promise<Cliente> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteData),
        });
        return handleResponse(response);
    }

    public async updateCliente(clienteData: Cliente): Promise<Cliente> {
        const response = await fetch(API_BASE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteData),
        });
        return handleResponse(response);
    }
}

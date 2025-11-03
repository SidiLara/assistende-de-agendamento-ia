import { Plano } from "./modelos/PlanoModel";
import { IServicoGestaoPlanos } from "./InterfacesGestaoPlanos";

const API_BASE_URL = '/api/planos';

// Helper to handle fetch responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export class ServicoGestaoPlanos implements IServicoGestaoPlanos {
    public async getAll(): Promise<Plano[]> {
        const response = await fetch(API_BASE_URL);
        return handleResponse(response);
    }

    public async add(planoData: Omit<Plano, 'id'>): Promise<Plano> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(planoData),
        });
        return handleResponse(response);
    }

    public async update(planoData: Plano): Promise<Plano> {
        const response = await fetch(`${API_BASE_URL}/${planoData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(planoData),
        });
        return handleResponse(response);
    }
}

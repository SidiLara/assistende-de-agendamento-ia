import { Consultor } from "./modelos/ConsultorModel";
import { IServicoGestaoCrm } from "./InterfacesGestaoCrm";

const API_BASE_URL = '/api/consultores';

// Helper to handle fetch responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export class ServicoGestaoCrm implements IServicoGestaoCrm {
    public async getConsultores(): Promise<Consultor[]> {
        const response = await fetch(API_BASE_URL);
        return handleResponse(response);
    }

    public async addConsultor(consultorData: Omit<Consultor, 'id'>): Promise<Consultor> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(consultorData),
        });
        return handleResponse(response);
    }

    public async updateConsultor(consultorData: Consultor): Promise<Consultor> {
        const response = await fetch(API_BASE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(consultorData),
        });
        return handleResponse(response);
    }
}
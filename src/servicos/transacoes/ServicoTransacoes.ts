import { Transacao } from "./modelos/TransacaoModel";
import { IServicoTransacoes } from "./InterfacesTransacoes";

const API_BASE_URL = '/api/transacoes';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export class ServicoTransacoes implements IServicoTransacoes {
    public async getTransacoes(): Promise<Transacao[]> {
        const response = await fetch(API_BASE_URL);
        return handleResponse(response);
    }

    public async addTransacao(transacaoData: Omit<Transacao, 'id'>): Promise<Transacao> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transacaoData),
        });
        return handleResponse(response);
    }
}

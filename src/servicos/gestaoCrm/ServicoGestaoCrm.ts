import { Consultor } from "./modelos/ConsultorModel";
import { IServicoGestaoCrm } from "./InterfacesGestaoCrm";

// Mock data
const mockConsultores: Consultor[] = [
    { id: '1', nome: 'Sidinei Lara', plano: 'Premium', telefone: '(11) 98765-4321' },
    { id: '2', nome: 'Maria Silva', plano: 'Básico', telefone: '(21) 91234-5678' },
    { id: '3', nome: 'Carlos Souza', plano: 'Premium', telefone: '(31) 95555-8888' },
    { id: '4', nome: 'Ana Pereira', plano: 'Básico', telefone: '(41) 99999-0000' },
];

export class ServicoGestaoCrm implements IServicoGestaoCrm {
    public async getConsultores(): Promise<Consultor[]> {
        // Em uma aplicação real, aqui seria uma chamada de API.
        // Por enquanto, retornamos os dados mockados após um pequeno delay.
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...mockConsultores]); // Retorna uma cópia para evitar mutação direta
            }, 500);
        });
    }

    public async addConsultor(consultorData: Omit<Consultor, 'id'>): Promise<Consultor> {
        return new Promise(resolve => {
            setTimeout(() => {
                const novoConsultor: Consultor = {
                    id: Date.now().toString(), // ID simples para o mock
                    ...consultorData
                };
                mockConsultores.push(novoConsultor);
                resolve(novoConsultor);
            }, 300);
        });
    }
}
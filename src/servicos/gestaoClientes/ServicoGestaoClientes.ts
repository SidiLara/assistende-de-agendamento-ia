import { Cliente } from "./modelos/ClienteModel";
import { IServicoGestaoClientes } from "./InterfacesGestaoClientes";

// Mock data
const mockClientes: Cliente[] = [
    { id: '101', nome: 'Ana Beatriz', telefone: '(11) 91111-1111', email: 'ana@example.com', status: 'Agendado', consultorResponsavel: 'Sidinei Lara', dataAgendamento: '2024-07-25T10:00:00' },
    { id: '102', nome: 'Bruno Costa', telefone: '(21) 92222-2222', email: 'bruno@example.com', status: 'Em Contato', consultorResponsavel: 'Maria Silva' },
    { id: '103', nome: 'Carla Dias', telefone: '(31) 93333-3333', email: 'carla@example.com', status: 'Convertido', consultorResponsavel: 'Sidinei Lara' },
    { id: '104', nome: 'Daniel Martins', telefone: '(41) 94444-4444', email: 'daniel@example.com', status: 'Novo', consultorResponsavel: 'Carlos Souza' },
];

export class ServicoGestaoClientes implements IServicoGestaoClientes {
    public async getClientes(): Promise<Cliente[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...mockClientes]);
            }, 500);
        });
    }
}

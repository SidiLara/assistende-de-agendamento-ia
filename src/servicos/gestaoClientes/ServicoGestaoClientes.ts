import { Cliente, StatusCliente } from "./modelos/ClienteModel";
import { IServicoGestaoClientes } from "./InterfacesGestaoClientes";

// Mock data
const mockClientes: Cliente[] = [
    { id: 'c1', nome: 'Empresa Alpha', plano: 'Empresarial', telefone: '(11) 91111-1111', status: 'Ativo' },
    { id: 'c2', nome: 'Comércio Beta', plano: 'Premium', telefone: '(21) 92222-2222', status: 'Ativo' },
    { id: 'c3', nome: 'Serviços Gama', plano: 'Básico', telefone: '(31) 93333-3333', status: 'Inativo' },
    { id: 'c4', nome: 'Indústria Delta', plano: 'Premium', telefone: '(41) 94444-4444', status: 'Ativo' },
];

export class ServicoGestaoClientes implements IServicoGestaoClientes {
    public async getClientes(): Promise<Cliente[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...mockClientes]);
            }, 500);
        });
    }

    public async addCliente(clienteData: Omit<Cliente, 'id' | 'status'>): Promise<Cliente> {
        return new Promise(resolve => {
            setTimeout(() => {
                const novoCliente: Cliente = {
                    id: `c${Date.now()}`,
                    status: 'Ativo',
                    ...clienteData
                };
                mockClientes.push(novoCliente);
                resolve(novoCliente);
            }, 300);
        });
    }

    public async updateCliente(clienteAtualizado: Cliente): Promise<Cliente> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockClientes.findIndex(c => c.id === clienteAtualizado.id);
                if (index !== -1) {
                    mockClientes[index] = clienteAtualizado;
                    resolve(clienteAtualizado);
                } else {
                    reject(new Error("Cliente não encontrado."));
                }
            }, 300);
        });
    }
}

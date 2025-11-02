import { Cliente, StatusCliente } from "./modelos/ClienteModel";
import { IServicoGestaoClientes } from "./InterfacesGestaoClientes";

const mockClientes: Cliente[] = [
    { id: '1', nome: 'Sidinei Lara', plano: 'Premium', telefone: '(11) 98765-4321', status: 'Ativo' },
    { id: '2', nome: 'Maria Silva', plano: 'Básico', telefone: '(21) 91234-5678', status: 'Ativo' },
    { id: '3', nome: 'Acme Corporation', plano: 'Empresarial', telefone: '(31) 95555-8888', status: 'Ativo' },
    { id: '4', nome: 'Ana Pereira', plano: 'Básico', telefone: '(41) 99999-0000', status: 'Inativo' },
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
                    id: Date.now().toString(),
                    ...clienteData,
                    status: 'Ativo'
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
                    reject(new Error("Cliente não encontrado"));
                }
            }, 300);
        });
    }
}

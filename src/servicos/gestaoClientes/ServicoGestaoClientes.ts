import { Cliente } from "./modelos/ClienteModel";
import { IServicoGestaoClientes } from "./InterfacesGestaoClientes";

const mockClientes: Cliente[] = [
    { id: '1', nome: 'Sidinei Lara', plano: 'Premium', telefone: '(11) 98765-4321' },
    { id: '2', nome: 'Maria Silva', plano: 'Básico', telefone: '(21) 91234-5678' },
    { id: '3', nome: 'Acme Corporation', plano: 'Empresarial', telefone: '(31) 95555-8888' },
    { id: '4', nome: 'Ana Pereira', plano: 'Básico', telefone: '(41) 99999-0000' },
];

export class ServicoGestaoClientes implements IServicoGestaoClientes {
    public async getClientes(): Promise<Cliente[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...mockClientes]); 
            }, 500);
        });
    }

    public async addCliente(clienteData: Omit<Cliente, 'id'>): Promise<Cliente> {
        return new Promise(resolve => {
            setTimeout(() => {
                const novoCliente: Cliente = {
                    id: Date.now().toString(),
                    ...clienteData
                };
                mockClientes.push(novoCliente);
                resolve(novoCliente);
            }, 300);
        });
    }
}
import * as React from 'react';
import { ListaDeClientes } from '../../componentes/ListaDeClientes';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarCliente } from '../../componentes/FormularioAdicionarCliente';
import { ServicoGestaoClientes, Cliente } from '../../servicos/gestaoClientes';

export const Clientes: React.FC = () => {
    const [clientes, setClientes] = React.useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [termoDeBusca, setTermoDeBusca] = React.useState('');
    
    const crmService = React.useMemo(() => new ServicoGestaoClientes(), []);

    React.useEffect(() => {
        crmService.getClientes()
            .then(data => {
                setClientes(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar clientes:", error);
                setIsLoading(false);
            });
    }, [crmService]);

    const handleSalvarCliente = async (novoClienteData: Omit<Cliente, 'id'>) => {
        try {
            const clienteAdicionado = await crmService.addCliente(novoClienteData);
            setClientes(prev => [...prev, clienteAdicionado].sort((a, b) => a.nome.localeCompare(b.nome)));
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao adicionar cliente:", error);
        }
    };

    const clientesFiltrados = React.useMemo(() => {
        return clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(termoDeBusca.toLowerCase())
        );
    }, [clientes, termoDeBusca]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
                <div className="flex items-center gap-3 w-full md:w-auto">
                     <input
                        type="search"
                        placeholder="Pesquisar cliente..."
                        value={termoDeBusca}
                        onChange={(e) => setTermoDeBusca(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue bg-white dark:bg-dark-tertiary w-full md:w-64"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0"
                    >
                        Adicionar Cliente
                    </button>
                </div>
            </div>
            {isLoading ? (
                <p>Carregando clientes...</p>
            ) : (
                <ListaDeClientes clientes={clientesFiltrados} />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                titulo="Adicionar Novo Cliente"
            >
                <FormularioAdicionarCliente
                    onSalvar={handleSalvarCliente}
                    onCancelar={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
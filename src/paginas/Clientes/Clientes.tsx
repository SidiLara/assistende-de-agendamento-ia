import * as React from 'react';
import { ListaDeClientes } from '../../componentes/ListaDeClientes';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarCliente } from '../../componentes/FormularioAdicionarCliente';
import { ServicoGestaoClientes, Cliente, StatusCliente } from '../../servicos/gestaoClientes';
import { ServicoGestaoPlanos, Plano } from '../../servicos/gestaoPlanos';

export const Clientes: React.FC = () => {
    const [clientes, setClientes] = React.useState<Cliente[]>([]);
    const [planos, setPlanos] = React.useState<Plano[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [clienteParaEditar, setClienteParaEditar] = React.useState<Cliente | null>(null);
    const [filtro, setFiltro] = React.useState('');
    
    const crmService = React.useMemo(() => new ServicoGestaoClientes(), []);
    const planosService = React.useMemo(() => new ServicoGestaoPlanos(), []);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [clientesData, planosData] = await Promise.all([
                    crmService.getClientes(),
                    planosService.getPlanos()
                ]);
                setClientes(clientesData);
                setPlanos(planosData);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [crmService, planosService]);

    const handleAbrirModalParaAdicionar = () => {
        setClienteParaEditar(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalParaEditar = (cliente: Cliente) => {
        setClienteParaEditar(cliente);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
        setClienteParaEditar(null);
    };
    
    const handleSalvarCliente = async (clienteData: Omit<Cliente, 'id' | 'status'>) => {
        try {
            if (clienteParaEditar) {
                const clienteAtualizado = await crmService.updateCliente({ ...clienteParaEditar, ...clienteData });
                setClientes(prev => prev.map(c => c.id === clienteAtualizado.id ? clienteAtualizado : c));
            } else {
                const clienteAdicionado = await crmService.addCliente(clienteData);
                setClientes(prev => [...prev, clienteAdicionado]);
            }
            handleFecharModal();
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
        }
    };

    const handleToggleStatus = async (cliente: Cliente) => {
        const statusAtualizado: StatusCliente = cliente.status === 'Ativo' ? 'Inativo' : 'Ativo';
        const clienteAtualizado = { ...cliente, status: statusAtualizado };
        try {
            await crmService.updateCliente(clienteAtualizado);
            setClientes(prev => prev.map(c => c.id === cliente.id ? clienteAtualizado : c));
        } catch (error) {
            console.error("Erro ao atualizar status do cliente:", error);
        }
    };

    const clientesFiltrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold flex-shrink-0">Gerenciamento de Clientes</h1>
                <div className="w-full md:w-auto flex-grow md:max-w-xs">
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-dark-tertiary"
                    />
                </div>
                <button
                    onClick={handleAbrirModalParaAdicionar}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
                >
                    Adicionar Cliente
                </button>
            </div>
            {isLoading ? (
                <p>Carregando clientes...</p>
            ) : (
                <ListaDeClientes 
                    clientes={clientesFiltrados}
                    onEditar={handleAbrirModalParaEditar}
                    onToggleStatus={handleToggleStatus}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleFecharModal}
                titulo={clienteParaEditar ? "Editar Cliente" : "Adicionar Novo Cliente"}
            >
                <FormularioAdicionarCliente
                    clienteParaEditar={clienteParaEditar}
                    planosDisponiveis={planos}
                    onSalvar={handleSalvarCliente}
                    onCancelar={handleFecharModal}
                />
            </Modal>
        </div>
    );
};
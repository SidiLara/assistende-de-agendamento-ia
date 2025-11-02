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
    const [clienteParaEditar, setClienteParaEditar] = React.useState<Cliente | null>(null);
    
    const crmService = React.useMemo(() => new ServicoGestaoClientes(), []);

    React.useEffect(() => {
        crmService.getClientes()
            .then(data => {
                setClientes(data.sort((a, b) => a.nome.localeCompare(b.nome)));
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar clientes:", error);
                setIsLoading(false);
            });
    }, [crmService]);

    const abrirModalParaAdicionar = () => {
        setClienteParaEditar(null);
        setIsModalOpen(true);
    };

    const abrirModalParaEditar = (cliente: Cliente) => {
        setClienteParaEditar(cliente);
        setIsModalOpen(true);
    };

    const handleSalvarCliente = async (dadosCliente: Omit<Cliente, 'id' | 'status'> | Cliente) => {
        try {
            if ('id' in dadosCliente) {
                // Editando cliente
                const clienteAtualizado = await crmService.updateCliente(dadosCliente);
                setClientes(prev => prev.map(c => c.id === clienteAtualizado.id ? clienteAtualizado : c));
            } else {
                // Adicionando novo cliente
                const clienteAdicionado = await crmService.addCliente(dadosCliente);
                setClientes(prev => [...prev, clienteAdicionado].sort((a, b) => a.nome.localeCompare(b.nome)));
            }
            setIsModalOpen(false);
            setClienteParaEditar(null);
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
        }
    };

    const handleToggleStatusCliente = async (cliente: Cliente) => {
        const novoStatus = cliente.status === 'Ativo' ? 'Inativo' : 'Ativo';
        const confirmMessage = `Tem certeza que deseja ${novoStatus === 'Inativo' ? 'inativar' : 'reativar'} o cliente ${cliente.nome}?`;

        if (window.confirm(confirmMessage)) {
            try {
                const clienteAtualizado = await crmService.updateCliente({ ...cliente, status: novoStatus });
                setClientes(prev => prev.map(c => c.id === clienteAtualizado.id ? clienteAtualizado : c));
            } catch (error) {
                console.error("Erro ao alterar status do cliente:", error);
            }
        }
    };

    const clientesFiltrados = React.useMemo(() => {
        return clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(termoDeBusca.toLowerCase())
        );
    }, [clientes, termoDeBusca]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold flex-shrink-0">Gerenciamento de Clientes</h1>
                <div className="flex items-center gap-3 w-full md:w-auto">
                     <input
                        type="search"
                        placeholder="Pesquisar cliente..."
                        value={termoDeBusca}
                        onChange={(e) => setTermoDeBusca(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue bg-white dark:bg-dark-tertiary w-full md:w-64"
                    />
                    <button
                        onClick={abrirModalParaAdicionar}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0"
                    >
                        Adicionar Cliente
                    </button>
                </div>
            </div>
            {isLoading ? (
                <p>Carregando clientes...</p>
            ) : (
                <ListaDeClientes 
                    clientes={clientesFiltrados} 
                    onEditar={abrirModalParaEditar}
                    onToggleStatus={handleToggleStatusCliente}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                titulo={clienteParaEditar ? "Editar Cliente" : "Adicionar Novo Cliente"}
            >
                <FormularioAdicionarCliente
                    clienteExistente={clienteParaEditar}
                    onSalvar={handleSalvarCliente}
                    onCancelar={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
import * as React from 'react';
import { ListaDeClientes } from '../../componentes/ListaDeClientes';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarCliente } from '../../componentes/FormularioAdicionarCliente';
import { ServicoGestaoClientes, Cliente } from '../../servicos/gestaoClientes';
import { ServicoGestaoPlanos, Plano } from '../../servicos/gestaoPlanos';
import { getFriendlyApiError } from '../../utils/apiErrorHandler';
import { useAuth } from '../../hooks/useAuth';
import { ServicoAuditoria } from '../../servicos/auditoria';
import { Toast } from '../../componentes/Toast';

export const Clientes: React.FC = () => {
    const [clientes, setClientes] = React.useState<Cliente[]>([]);
    const [planos, setPlanos] = React.useState<Plano[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [clienteParaEditar, setClienteParaEditar] = React.useState<Cliente | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [apiError, setApiError] = React.useState<string | null>(null);
    const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const { user } = useAuth();
    
    const crmService = React.useMemo(() => new ServicoGestaoClientes(), []);
    const planosService = React.useMemo(() => new ServicoGestaoPlanos(), []);
    const auditoriaService = React.useMemo(() => new ServicoAuditoria(), []);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const [clientesData, planosData] = await Promise.all([
                    crmService.getClientes(),
                    planosService.getPlanos()
                ]);
                setClientes(clientesData);
                setPlanos(planosData);
            } catch (err) {
                console.error("Erro ao buscar dados:", err);
                setError(getFriendlyApiError(err, 'os clientes e planos'));
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
        setApiError(null);
    };

    const handleSalvarCliente = async (clienteData: Omit<Cliente, 'id'>) => {
        setIsSaving(true);
        setApiError(null);
        try {
            if (clienteParaEditar) {
                const clienteAtualizado = await crmService.updateCliente({ ...clienteParaEditar, ...clienteData });
                setClientes(prev => prev.map(c => c.id === clienteAtualizado.id ? clienteAtualizado : c));
                await auditoriaService.addLog({ usuario: user?.email || 'Sistema', acao: 'ATUALIZACAO', entidade: 'Cliente', entidadeId: clienteAtualizado.id, detalhes: `Cliente "${clienteAtualizado.nome}" atualizado.` });
                setToast({ message: 'Cliente atualizado com sucesso!', type: 'success' });
            } else {
                const clienteAdicionado = await crmService.addCliente(clienteData);
                setClientes(prev => [...prev, clienteAdicionado]);
                await auditoriaService.addLog({ usuario: user?.email || 'Sistema', acao: 'CRIACAO', entidade: 'Cliente', entidadeId: clienteAdicionado.id, detalhes: `Cliente "${clienteAdicionado.nome}" criado.` });
                setToast({ message: 'Cliente adicionado com sucesso!', type: 'success' });
            }
            handleFecharModal();
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            setApiError(getFriendlyApiError(error, 'salvar o cliente'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
                <button
                    onClick={handleAbrirModalParaAdicionar}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Adicionar Cliente
                </button>
            </div>
            {isLoading ? (
                <p>Carregando clientes...</p>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            ) : (
                <ListaDeClientes
                    clientes={clientes.filter(c => c.tipo === 'Cliente')}
                    planos={planos}
                    onEditar={handleAbrirModalParaEditar}
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
                    isSaving={isSaving}
                    apiError={apiError}
                />
            </Modal>
        </div>
    );
};

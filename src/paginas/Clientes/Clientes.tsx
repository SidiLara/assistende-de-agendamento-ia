import * as React from 'react';
import { ListaDeClientes } from '../../componentes/ListaDeClientes';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarCliente } from '../../componentes/FormularioAdicionarCliente';
import { ServicoGestaoClientes } from '../../services/gestaoClientes';
import { ServicoGestaoPlanos, Plano } from '../../services/gestaoPlanos';
import { useGerenciamento } from '../../hooks/useGerenciamento';
import { Toast } from '../../componentes/Toast';

export const Clientes: React.FC = () => {
    const {
        items: clientes,
        isLoading,
        error,
        isModalOpen,
        itemParaEditar: clienteParaEditar,
        isSaving,
        apiError,
        toast,
        setToast,
        handleAbrirModalParaAdicionar,
        handleAbrirModalParaEditar,
        handleFecharModal,
        handleSalvarItem,
    } = useGerenciamento({
        service: new ServicoGestaoClientes(),
        entidade: 'Cliente',
        entidadePlural: 'Clientes',
    });

    const [planos, setPlanos] = React.useState<Plano[]>([]);
    const planosService = React.useMemo(() => new ServicoGestaoPlanos(), []);

    React.useEffect(() => {
        const fetchPlanos = async () => {
            try {
                const planosData = await planosService.getAll();
                setPlanos(planosData);
            } catch (err) {
                console.error("Erro ao buscar planos:", err);
            }
        };
        fetchPlanos();
    }, [planosService]);

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
                titulo={clienteParaEditar ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
            >
                <FormularioAdicionarCliente
                    clienteParaEditar={clienteParaEditar}
                    planosDisponiveis={planos}
                    onSalvar={handleSalvarItem}
                    onCancelar={handleFecharModal}
                    isSaving={isSaving}
                    apiError={apiError}
                />
            </Modal>
        </div>
    );
};

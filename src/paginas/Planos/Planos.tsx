import * as React from 'react';
import { ListaDePlanos } from '../../componentes/ListaDePlanos';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarPlano } from '../../componentes/FormularioAdicionarPlano';
import { ServicoGestaoPlanos, Plano } from '../../servicos/gestaoPlanos';
import { getFriendlyApiError } from '../../utils/apiErrorHandler';
import { useAuth } from '../../hooks/useAuth';
import { ServicoAuditoria } from '../../servicos/auditoria';
import { Toast } from '../../componentes/Toast';

export const Planos: React.FC = () => {
    const [planos, setPlanos] = React.useState<Plano[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [apiError, setApiError] = React.useState<string | null>(null);
    const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const { user } = useAuth();
    
    const planosService = React.useMemo(() => new ServicoGestaoPlanos(), []);
    const auditoriaService = React.useMemo(() => new ServicoAuditoria(), []);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const planosData = await planosService.getPlanos();
                setPlanos(planosData);
            } catch (err) {
                console.error("Erro ao buscar planos:", err);
                setError(getFriendlyApiError(err, 'os planos'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [planosService]);

    const handleAbrirModal = () => {
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
        setApiError(null);
    };

    const handleSalvarPlano = async (planoData: Omit<Plano, 'id'>) => {
        setIsSaving(true);
        setApiError(null);
        try {
            const planoAdicionado = await planosService.addPlano(planoData);
            setPlanos(prev => [...prev, planoAdicionado]);
            await auditoriaService.addLog({ usuario: user?.email || 'Sistema', acao: 'CRIACAO', entidade: 'Plano', entidadeId: planoAdicionado.id, detalhes: `Plano "${planoAdicionado.nome}" criado com valor ${planoAdicionado.valor}.` });
            setToast({ message: 'Plano adicionado com sucesso!', type: 'success' });
            handleFecharModal();
        } catch (error) {
            console.error("Erro ao salvar plano:", error);
            setApiError(getFriendlyApiError(error, 'salvar o plano'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciamento de Planos</h1>
                <button
                    onClick={handleAbrirModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Adicionar Plano
                </button>
            </div>
            {isLoading ? (
                <p>Carregando planos...</p>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            ) : (
                <ListaDePlanos planos={planos} />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleFecharModal}
                titulo="Adicionar Novo Plano"
            >
                <FormularioAdicionarPlano
                    onSalvar={handleSalvarPlano}
                    onCancelar={handleFecharModal}
                    isSaving={isSaving}
                    apiError={apiError}
                />
            </Modal>
        </div>
    );
};

import * as React from 'react';
import { ListaDeConsultores } from '../../componentes/ListaDeConsultores';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarConsultor } from '../../componentes/FormularioAdicionarConsultor';
import { ServicoGestaoCrm, Consultor } from '../../servicos/gestaoCrm';
import { ServicoGestaoPlanos, Plano } from '../../servicos/gestaoPlanos';
import { getFriendlyApiError } from '../../utils/apiErrorHandler';
import { useAuth } from '../../hooks/useAuth';
import { ServicoAuditoria } from '../../servicos/auditoria';

export const Consultores: React.FC = () => {
    const [consultores, setConsultores] = React.useState<Consultor[]>([]);
    const [planos, setPlanos] = React.useState<Plano[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [consultorParaEditar, setConsultorParaEditar] = React.useState<Consultor | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const { user } = useAuth();
    
    const crmService = React.useMemo(() => new ServicoGestaoCrm(), []);
    const planosService = React.useMemo(() => new ServicoGestaoPlanos(), []);
    const auditoriaService = React.useMemo(() => new ServicoAuditoria(), []);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const [consultoresData, planosData] = await Promise.all([
                    crmService.getConsultores(),
                    planosService.getPlanos()
                ]);
                setConsultores(consultoresData);
                setPlanos(planosData);
            } catch (err) {
                console.error("Erro ao buscar dados:", err);
                setError(getFriendlyApiError(err, 'os consultores e planos'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [crmService, planosService]);

    const handleAbrirModalParaAdicionar = () => {
        setConsultorParaEditar(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalParaEditar = (consultor: Consultor) => {
        setConsultorParaEditar(consultor);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
        setConsultorParaEditar(null);
    };

    const handleSalvarConsultor = async (consultorData: Omit<Consultor, 'id'>) => {
        try {
            if (consultorParaEditar) {
                const consultorAtualizado = await crmService.updateConsultor({ ...consultorParaEditar, ...consultorData });
                setConsultores(prev => prev.map(c => c.id === consultorAtualizado.id ? consultorAtualizado : c));
                await auditoriaService.addLog({ usuario: user?.email || 'Sistema', acao: 'ATUALIZACAO', entidade: 'Consultor', entidadeId: consultorAtualizado.id, detalhes: `Consultor "${consultorAtualizado.nome}" atualizado.` });
            } else {
                const consultorAdicionado = await crmService.addConsultor(consultorData);
                setConsultores(prev => [...prev, consultorAdicionado]);
                await auditoriaService.addLog({ usuario: user?.email || 'Sistema', acao: 'CRIACAO', entidade: 'Consultor', entidadeId: consultorAdicionado.id, detalhes: `Consultor "${consultorAdicionado.nome}" criado.` });
            }
            handleFecharModal();
        } catch (error) {
            console.error("Erro ao salvar consultor:", error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciamento de Consultores</h1>
                <button
                    onClick={handleAbrirModalParaAdicionar}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Adicionar Consultor
                </button>
            </div>
            {isLoading ? (
                <p>Carregando consultores...</p>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            ) : (
                <ListaDeConsultores 
                    consultores={consultores}
                    planos={planos}
                    onEditar={handleAbrirModalParaEditar}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleFecharModal}
                titulo={consultorParaEditar ? "Editar Consultor" : "Adicionar Novo Consultor"}
            >
                <FormularioAdicionarConsultor
                    consultorParaEditar={consultorParaEditar}
                    planosDisponiveis={planos}
                    onSalvar={handleSalvarConsultor}
                    onCancelar={handleFecharModal}
                />
            </Modal>
        </div>
    );
};

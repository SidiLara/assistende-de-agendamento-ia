import * as React from 'react';
import { ServicoGestaoUsuarios, Usuario } from '../../services/gestaoUsuarios';
import { ListaDeUsuarios } from '../../componentes/ListaDeUsuarios';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarUsuario } from '../../componentes/FormularioAdicionarUsuario';
import { getFriendlyApiError } from '../../utils/apiErrorHandler';
import { useAuth } from '../../hooks/useAuth';
import { ServicoAuditoria } from '../../services/auditoria';
import { Toast } from '../../componentes/Toast';

export const Usuarios: React.FC = () => {
    const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [apiError, setApiError] = React.useState<string | null>(null);
    const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const { user } = useAuth();
    
    const usuariosService = React.useMemo(() => new ServicoGestaoUsuarios(), []);
    const auditoriaService = React.useMemo(() => new ServicoAuditoria(), []);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const usuariosData = await usuariosService.getUsuarios();
                setUsuarios(usuariosData);
            } catch (err) {
                console.error("Erro ao buscar usuários:", err);
                setError(getFriendlyApiError(err, 'os usuários'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [usuariosService]);

    const handleAbrirModal = () => {
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
        setApiError(null);
    };

    const handleSalvarUsuario = async (usuarioData: Omit<Usuario, 'id'> & { password?: string }) => {
        setIsSaving(true);
        setApiError(null);
        try {
            const usuarioAdicionado = await usuariosService.addUsuario(usuarioData);
            setUsuarios(prev => [...prev, usuarioAdicionado]);
            await auditoriaService.addLog({ usuario: user?.email || 'Sistema', acao: 'CRIACAO', entidade: 'Usuario', entidadeId: usuarioAdicionado.id, detalhes: `Usuário "${usuarioAdicionado.email}" criado.` });
            setToast({ message: 'Usuário adicionado com sucesso!', type: 'success' });
            handleFecharModal();
        } catch (error) {
            console.error("Erro ao salvar usuário:", error);
            setApiError(getFriendlyApiError(error, 'salvar o usuário'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
                <button
                    onClick={handleAbrirModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Adicionar Usuário
                </button>
            </div>
            {isLoading ? (
                <p>Carregando usuários...</p>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            ) : (
                <ListaDeUsuarios usuarios={usuarios} />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleFecharModal}
                titulo="Adicionar Novo Usuário"
            >
                <FormularioAdicionarUsuario
                    onSalvar={handleSalvarUsuario}
                    onCancelar={handleFecharModal}
                    isSaving={isSaving}
                    apiError={apiError}
                />
            </Modal>
        </div>
    );
};

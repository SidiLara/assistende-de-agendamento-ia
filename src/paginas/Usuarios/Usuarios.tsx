import * as React from 'react';
import { ListaDeUsuarios } from '../../componentes/ListaDeUsuarios';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarUsuario } from '../../componentes/FormularioAdicionarUsuario';
import { ServicoGestaoUsuarios, Usuario } from '../../servicos/gestaoUsuarios';
import { getFriendlyApiError } from '../../utils/apiErrorHandler';
import { useAuth } from '../../hooks/useAuth';
import { ServicoAuditoria } from '../../servicos/auditoria';

export const Usuarios: React.FC = () => {
    const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { user } = useAuth();
    
    const usuariosService = React.useMemo(() => new ServicoGestaoUsuarios(), []);
    const auditoriaService = React.useMemo(() => new ServicoAuditoria(), []);

    React.useEffect(() => {
        setIsLoading(true);
        setError(null);
        usuariosService.getUsuarios()
            .then(data => {
                setUsuarios(data);
            })
            .catch(err => {
                console.error("Erro ao buscar usuários:", err);
                setError(getFriendlyApiError(err, 'os usuários'));
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [usuariosService]);

    const handleSalvarUsuario = async (novoUsuarioData: Omit<Usuario, 'id'> & { password?: string }) => {
        try {
            const usuarioAdicionado = await usuariosService.addUsuario(novoUsuarioData);
            setUsuarios(prev => [...prev, usuarioAdicionado]);
            setIsModalOpen(false);
            await auditoriaService.addLog({ usuario: user?.email || 'Sistema', acao: 'CRIACAO', entidade: 'Usuario', entidadeId: usuarioAdicionado.id, detalhes: `Usuário "${usuarioAdicionado.email}" criado com o papel de ${usuarioAdicionado.role}.` });
        } catch (error) {
            console.error("Erro ao adicionar usuário:", error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
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
                onClose={() => setIsModalOpen(false)}
                titulo="Adicionar Novo Usuário"
            >
                <FormularioAdicionarUsuario
                    onSalvar={handleSalvarUsuario}
                    onCancelar={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

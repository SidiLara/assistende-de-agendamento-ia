import * as React from 'react';
import { ListaDePlanos } from '../../componentes/ListaDePlanos';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarPlano } from '../../componentes/FormularioAdicionarPlano';
import { ServicoGestaoPlanos, Plano } from '../../servicos/gestaoPlanos';

export const Planos: React.FC = () => {
    const [planos, setPlanos] = React.useState<Plano[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    
    const planosService = React.useMemo(() => new ServicoGestaoPlanos(), []);

    React.useEffect(() => {
        setIsLoading(true);
        setError(null);
        planosService.getPlanos()
            .then(data => {
                setPlanos(data);
            })
            .catch(error => {
                console.error("Erro ao buscar planos:", error);
                setError("Não foi possível carregar os planos. Verifique a configuração da API do Google Sheets e se a planilha está acessível.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [planosService]);

    const handleSalvarPlano = async (novoPlanoData: Omit<Plano, 'id'>) => {
        try {
            const planoAdicionado = await planosService.addPlano(novoPlanoData);
            setPlanos(prev => [...prev, planoAdicionado]);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao adicionar plano:", error);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold flex-shrink-0">Gerenciamento de Planos</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
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
                onClose={() => setIsModalOpen(false)}
                titulo="Adicionar Novo Plano"
            >
                <FormularioAdicionarPlano
                    onSalvar={handleSalvarPlano}
                    onCancelar={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
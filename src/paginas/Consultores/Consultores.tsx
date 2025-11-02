import * as React from 'react';
import { ListaDeConsultores } from '../../componentes/ListaDeConsultores';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarConsultor } from '../../componentes/FormularioAdicionarConsultor';
import { ServicoGestaoCrm, Consultor } from '../../servicos/gestaoCrm';

export const Consultores: React.FC = () => {
    const [consultores, setConsultores] = React.useState<Consultor[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    
    const crmService = React.useMemo(() => new ServicoGestaoCrm(), []);

    React.useEffect(() => {
        crmService.getConsultores()
            .then(data => {
                setConsultores(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar consultores:", error);
                setIsLoading(false);
            });
    }, [crmService]);

    const handleSalvarConsultor = async (novoConsultorData: Omit<Consultor, 'id'>) => {
        try {
            const consultorAdicionado = await crmService.addConsultor(novoConsultorData);
            setConsultores(prev => [...prev, consultorAdicionado]);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao adicionar consultor:", error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciamento de Consultores</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Adicionar Consultor
                </button>
            </div>
            {isLoading ? (
                <p>Carregando consultores...</p>
            ) : (
                <ListaDeConsultores consultores={consultores} />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                titulo="Adicionar Novo Consultor"
            >
                <FormularioAdicionarConsultor
                    onSalvar={handleSalvarConsultor}
                    onCancelar={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

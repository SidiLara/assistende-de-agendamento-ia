
import * as React from 'react';
import { AssistenteModel } from './modelos/AssistenteModel';
import { FormularioAssistente } from './componentes/FormularioAssistente';
import { adicionarAssistente } from './actions';

export const Crm: React.FC = () => {
    const [assistentes, setAssistentes] = React.useState<AssistenteModel[]>([]);
    const [assistenteEditando, setAssistenteEditando] = React.useState<AssistenteModel | null>(null);
    const [isModalAberto, setIsModalAberto] = React.useState(false);

    const handleAbrirModal = (assistente: AssistenteModel | null = null) => {
        setAssistenteEditando(assistente);
        setIsModalAberto(true);
    };

    const handleFecharModal = () => {
        setAssistenteEditando(null);
        setIsModalAberto(false);
    };

    const handleSalvarAssistente = async (assistente: Omit<AssistenteModel, 'id'>) => {
        if (assistenteEditando) {
            // Lógica para editar um assistente
        } else {
            const novoAssistente = await adicionarAssistente(assistente);
            setAssistentes([...assistentes, novoAssistente]);
        }
        handleFecharModal();
    };

    const handleExcluirAssistente = (id: string) => {
        setAssistentes(assistentes.filter(a => a.id !== id));
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Gerenciador de Assistentes</h1>
            <button
                onClick={() => handleAbrirModal()}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                Adicionar Assistente
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assistentes.map(assistente => (
                    <div key={assistente.id} className="bg-white p-4 rounded shadow">
                        <img src={assistente.avatar} alt={assistente.nome} className="w-24 h-24 rounded-full mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-center mb-2">{assistente.nome}</h2>
                        <p className="text-gray-600 text-center mb-4">{assistente.webhook}</p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => handleAbrirModal(assistente)}
                                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleExcluirAssistente(assistente.id)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {isModalAberto && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <FormularioAssistente
                            assistente={assistenteEditando}
                            onSalvar={handleSalvarAssistente}
                            onCancelar={handleFecharModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

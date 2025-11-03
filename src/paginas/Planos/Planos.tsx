import * as React from 'react';
import { ListaDePlanos } from '../../componentes/ListaDePlanos';
import { Modal } from '../../componentes/Modal';
import { FormularioAdicionarPlano } from '../../componentes/FormularioAdicionarPlano';
import { ServicoGestaoPlanos } from '../../services/gestaoPlanos';
import { useGerenciamento } from '../../hooks/useGerenciamento';
import { Toast } from '../../componentes/Toast';

export const Planos: React.FC = () => {
    const { 
        items: planos, 
        isLoading, 
        error, 
        isModalOpen, 
        isSaving, 
        apiError, 
        toast, 
        setToast, 
        handleAbrirModalParaAdicionar, 
        handleFecharModal, 
        handleSalvarItem 
    } = useGerenciamento({
        service: new ServicoGestaoPlanos(),
        entidade: 'Plano',
        entidadePlural: 'Planos'
    });

    return (
        <div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciamento de Planos</h1>
                <button
                    onClick={handleAbrirModalParaAdicionar}
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
                    onSalvar={handleSalvarItem}
                    onCancelar={handleFecharModal}
                    isSaving={isSaving}
                    apiError={apiError}
                />
            </Modal>
        </div>
    );
};

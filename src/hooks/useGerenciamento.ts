
import * as React from 'react';
import { useAuth } from './useAuth';
import { ServicoAuditoria } from '../services/auditoria';
import { getFriendlyApiError } from '../utils/apiErrorHandler';

interface Service<T> {
    add: (item: Omit<T, 'id'>) => Promise<T>;
    update: (item: T) => Promise<T>;
    getAll: () => Promise<T[]>;
}

interface UseGerenciamentoParams<T> {
    service: Service<T>;
    entidade: string;
    entidadePlural: string;
}

export const useGerenciamento = <T extends { id: string; nome: string }>({ service, entidade, entidadePlural }: UseGerenciamentoParams<T>) => {
    const [items, setItems] = React.useState<T[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [itemParaEditar, setItemParaEditar] = React.useState<T | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [apiError, setApiError] = React.useState<string | null>(null);
    const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const { user } = useAuth();
    const auditoriaService = React.useMemo(() => new ServicoAuditoria(), []);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await service.getAll();
                setItems(data);
            } catch (err) {
                console.error(`Erro ao buscar ${entidadePlural}:`, err);
                setError(getFriendlyApiError(err, `os ${entidadePlural}`));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [service, entidadePlural]);

    const handleAbrirModalParaAdicionar = () => {
        setItemParaEditar(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalParaEditar = (item: T) => {
        setItemParaEditar(item);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
        setItemParaEditar(null);
        setApiError(null);
    };

    const handleSalvarItem = async (itemData: Omit<T, 'id'>) => {
        setIsSaving(true);
        setApiError(null);
        try {
            if (itemParaEditar) {
                const itemAtualizado = await service.update({ ...itemParaEditar, ...itemData });
                setItems(prev => prev.map(i => i.id === itemAtualizado.id ? itemAtualizado : i));
                await auditoriaService.addLog({
                    usuario: user?.email || 'Sistema',
                    acao: 'ATUALIZACAO',
                    entidade,
                    entidadeId: itemAtualizado.id,
                    detalhes: `${entidade} "${itemAtualizado.nome}" atualizado.`
                });
                setToast({ message: `${entidade} atualizado com sucesso!`, type: 'success' });
            } else {
                const itemAdicionado = await service.add(itemData);
                setItems(prev => [...prev, itemAdicionado]);
                await auditoriaService.addLog({
                    usuario: user?.email || 'Sistema',
                    acao: 'CRIACAO',
                    entidade,
                    entidadeId: itemAdicionado.id,
                    detalhes: `${entidade} "${itemAdicionado.nome}" criado.`
                });
                setToast({ message: `${entidade} adicionado com sucesso!`, type: 'success' });
            }
            handleFecharModal();
        } catch (error) {
            console.error(`Erro ao salvar ${entidade}:`, error);
            setApiError(getFriendlyApiError(error, `salvar o ${entidade.toLowerCase()}`));
        } finally {
            setIsSaving(false);
        }
    };

    return {
        items,
        isLoading,
        error,
        isModalOpen,
        itemParaEditar,
        isSaving,
        apiError,
        toast,
        setToast,
        handleAbrirModalParaAdicionar,
        handleAbrirModalParaEditar,
        handleFecharModal,
        handleSalvarItem
    };
};

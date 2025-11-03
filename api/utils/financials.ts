// api/utils/financials.ts
// FIX: Changed import path to directly reference the model file to avoid resolution issues.
import { Cliente } from '../../src/servicos/gestaoClientes/modelos/ClienteModel';

/**
 * Verifica se o plano de uma entidade (Cliente ou Consultor) está ativo em um determinado mês/ano.
 * @param entidade O objeto do cliente ou consultor.
 * @param targetMonth O mês alvo (0-11).
 * @param targetYear O ano alvo.
 * @returns `true` se o plano estiver ativo, `false` caso contrário.
 */
export const isPlanoAtivo = (entidade: Cliente, targetMonth: number, targetYear: number): boolean => {
    if (!entidade.dataInicio || entidade.status === 'Inativo') {
        return false;
    }

    const dataInicio = new Date(entidade.dataInicio + 'T00:00:00');
    const inicioAno = dataInicio.getFullYear();
    const inicioMes = dataInicio.getMonth();

    if (inicioAno > targetYear || (inicioAno === targetYear && inicioMes > targetMonth)) {
        return false;
    }

    if (entidade.tipoPagamento === 'Fixo') {
        return true;
    }

    if (entidade.tipoPagamento === 'Parcelado' && entidade.numeroParcelas) {
        const dataFim = new Date(dataInicio);
        dataFim.setMonth(dataInicio.getMonth() + entidade.numeroParcelas);
        
        const fimAno = dataFim.getFullYear();
        const fimMes = dataFim.getMonth();
        
        return targetYear < fimAno || (targetYear === fimAno && targetMonth < fimMes);
    }

    return false;
};

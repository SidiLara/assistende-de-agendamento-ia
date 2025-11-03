import { Transacao } from '../../servicos/transacoes';
import { Cliente } from '../../servicos/gestaoClientes';
import { Plano } from '../../servicos/gestaoPlanos';
import { Consultor } from '../../servicos/gestaoCrm';

export interface FormularioAdicionarTransacaoProps {
    onSalvar: (transacaoData: Omit<Transacao, 'id'>) => void;
    onCancelar: () => void;
    clientes: Cliente[];
    planos: Plano[];
    consultores: Consultor[];
    isSaving?: boolean;
    apiError?: string | null;
}

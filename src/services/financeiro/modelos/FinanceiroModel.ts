import { StatusCliente, TipoEntidade } from "../../gestaoClientes/modelos/ClienteModel";

export interface EntidadeFinanceira {
    id: string;
    nome: string;
    tipo: TipoEntidade;
    plano: string;
    valorPlano: number;
    status: StatusCliente;
}

export interface RelatorioFinanceiro {
    receitaTotal: number;
    assinaturasAtivas: number;
    receitaPorEntidade: EntidadeFinanceira[];
}

import { Transacao } from "./modelos/TransacaoModel";

export interface IServicoTransacoes {
    getTransacoes(): Promise<Transacao[]>;
    addTransacao(transacao: Omit<Transacao, 'id'>): Promise<Transacao>;
}

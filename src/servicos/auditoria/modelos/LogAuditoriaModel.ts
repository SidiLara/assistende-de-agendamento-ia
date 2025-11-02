export type AcaoAuditoria = 'CRIACAO' | 'ATUALIZACAO' | 'EXCLUSAO' | 'LOGIN';

export interface LogAuditoria {
    id: string;
    timestamp: Date;
    usuario: string;
    acao: AcaoAuditoria;
    entidade: string;
    entidadeId: string;
    detalhes: string;
}

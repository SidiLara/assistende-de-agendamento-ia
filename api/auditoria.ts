// This is a placeholder for a Vercel Serverless Function.
// It mocks API endpoints for managing audit logs.

export const getLogs = async () => {
    return Promise.resolve([
        { id: '1', timestamp: new Date(), usuario: 'Admin', acao: 'LOGIN', detalhes: 'Login bem-sucedido.' },
        { id: '2', timestamp: new Date(), usuario: 'Admin', acao: 'CRIACAO', detalhes: 'Cliente "Empresa Alpha" criado.' },
    ]);
};

export const addLog = async (log: any) => {
    const novoLog = { id: Date.now().toString(), timestamp: new Date(), ...log };
    return Promise.resolve(novoLog);
};

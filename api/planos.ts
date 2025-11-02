// This is a placeholder for a Vercel Serverless Function.
// It mocks API endpoints for managing plans.

export const getPlanos = async () => {
    return Promise.resolve([
        { id: '1', nome: 'Plano Básico', valor: 99.90 },
        { id: '2', nome: 'Plano Premium', valor: 199.90 },
    ]);
};

export const addPlano = async (plano: any) => {
    const novoPlano = { id: Date.now().toString(), ...plano };
    return Promise.resolve(novoPlano);
};

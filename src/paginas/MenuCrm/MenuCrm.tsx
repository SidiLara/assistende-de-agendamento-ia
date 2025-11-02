import * as React from 'react';

export const MenuCrm: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Painel do CRM</h1>
            <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Bem-vindo!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Use a navegação à esquerda para gerenciar consultores, visualizar clientes e analisar estatísticas.
                </p>
            </div>
        </div>
    );
};

import * as React from 'react';
import { ListaDePlanosProps } from './ListaDePlanos.props';
import { CartaoDePlano } from '../CartaoDePlano';

export const ListaDePlanos = ({ planos }: ListaDePlanosProps) => {
    if (!planos.length) {
        return <p className="text-center text-gray-500 dark:text-gray-400">Nenhum plano encontrado.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planos.map(plano => (
                <React.Fragment key={plano.id}>
                    <CartaoDePlano plano={plano} />
                </React.Fragment>
            ))}
        </div>
    );
};
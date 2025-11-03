import * as React from 'react';
import { ListaDeConsultoresProps } from './ListaDeConsultores.props';
import { CartaoDeConsultor } from '../CartaoDeConsultor';

export const ListaDeConsultores = ({ consultores, planos, onEditar }: ListaDeConsultoresProps) => {
    if (!consultores.length) {
        return <p className="text-center text-gray-500 dark:text-gray-400">Nenhum consultor encontrado.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultores.map(consultor => (
                // FIX: Wrapped CartaoDeConsultor in React.Fragment to resolve the TypeScript error
                // where 'key' was being incorrectly validated against CartaoDeConsultorProps.
                <React.Fragment key={consultor.id}>
                    <CartaoDeConsultor consultor={consultor} planos={planos} onEditar={onEditar} />
                </React.Fragment>
            ))}
        </div>
    );
};

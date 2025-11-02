import * as React from 'react';
import { ListaDeClientesProps } from './ListaDeClientes.props';
import { CartaoDeCliente } from '../CartaoDeCliente';

export const ListaDeClientes = ({ clientes, onEditar, onToggleStatus }: ListaDeClientesProps) => {
    if (!clientes.length) {
        return <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Nenhum cliente corresponde à sua busca.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientes.map(cliente => (
                <React.Fragment key={cliente.id}>
                    <CartaoDeCliente 
                        cliente={cliente} 
                        onEditar={onEditar}
                        onToggleStatus={onToggleStatus}
                    />
                </React.Fragment>
            ))}
        </div>
    );
};

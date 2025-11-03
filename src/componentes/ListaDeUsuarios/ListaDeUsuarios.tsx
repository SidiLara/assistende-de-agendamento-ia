import * as React from 'react';
import { ListaDeUsuariosProps } from './ListaDeUsuarios.props';
import { CartaoDeUsuario } from '../CartaoDeUsuario';

export const ListaDeUsuarios = ({ usuarios }: ListaDeUsuariosProps) => {
    if (!usuarios.length) {
        return <p className="text-center text-gray-500 dark:text-gray-400">Nenhum usuário encontrado.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map(usuario => (
                <React.Fragment key={usuario.id}>
                    <CartaoDeUsuario usuario={usuario} />
                </React.Fragment>
            ))}
        </div>
    );
};

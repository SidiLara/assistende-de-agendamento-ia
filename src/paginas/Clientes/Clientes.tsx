import * as React from 'react';
import { ListaDeClientes } from '../../componentes/ListaDeClientes';
import { ServicoGestaoClientes, Cliente } from '../../servicos/gestaoClientes';

export const Clientes: React.FC = () => {
    const [clientes, setClientes] = React.useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    
    const clientesService = React.useMemo(() => new ServicoGestaoClientes(), []);

    React.useEffect(() => {
        clientesService.getClientes()
            .then(data => {
                setClientes(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar clientes:", error);
                setIsLoading(false);
            });
    }, [clientesService]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Clientes</h1>
            </div>
            {isLoading ? (
                <p>Carregando clientes...</p>
            ) : (
                <ListaDeClientes clientes={clientes} />
            )}
        </div>
    );
};

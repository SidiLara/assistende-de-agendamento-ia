import * as React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { ServicoGestaoCrm } from '../../servicos/gestaoCrm/ServicoGestaoCrm';
import { Consultor } from '../../servicos/gestaoCrm/modelos/ConsultorModel';
import { ListaDeConsultores } from '../../componentes/ListaDeConsultores';

export const Crm: React.FC = () => {
    useDarkMode(); // Garante que o tema seja aplicado
    const [consultores, setConsultores] = React.useState<Consultor[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const crmService = new ServicoGestaoCrm();
        crmService.getConsultores()
            .then(data => {
                setConsultores(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Falha ao buscar consultores:", error);
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="bg-gray-100 dark:bg-black min-h-dvh w-full flex flex-col items-center p-4 md:p-8 font-sans">
            <header className="w-full max-w-7xl mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">CRM</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">Gestão de Consultores</p>
            </header>
            
            <main className="w-full max-w-7xl">
                {isLoading ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <p>Carregando consultores...</p>
                    </div>
                ) : (
                    <ListaDeConsultores consultores={consultores} />
                )}
            </main>
        </div>
    );
};

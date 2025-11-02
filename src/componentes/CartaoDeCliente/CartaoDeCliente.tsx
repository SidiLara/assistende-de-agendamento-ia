import { CartaoDeClienteProps } from './CartaoDeCliente.props';
import { TipoPlano } from '../../servicos/gestaoClientes/modelos/ClienteModel';

// --- Ícones ---
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const PlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const EyeOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;

// --- Estilos ---
const planStyles: Record<TipoPlano, { badge: string, text: string }> = {
    'Premium': { badge: 'bg-yellow-400 dark:bg-yellow-500', text: 'text-yellow-800 dark:text-yellow-100' },
    'Básico': { badge: 'bg-blue-400 dark:bg-blue-500', text: 'text-blue-800 dark:text-blue-100' },
    'Empresarial': { badge: 'bg-green-400 dark:bg-green-500', text: 'text-green-800 dark:text-green-100' }
};

export const CartaoDeCliente = ({ cliente, onEditar, onToggleStatus }: CartaoDeClienteProps) => {
    const { nome, plano, telefone, status } = cliente;
    const styles = planStyles[plano];
    const isInactive = status === 'Inativo';

    return (
        <div className={`bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700 transition-all duration-300 flex flex-col justify-between min-h-[190px] ${isInactive ? 'opacity-60' : 'hover:shadow-lg'}`}>
            
            {/* Header: Nome e Botões de Ação */}
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 pr-4 break-words">{nome}</h3>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button onClick={() => onEditar(cliente)} title="Editar Cliente" className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-brand-blue rounded-full transition-colors">
                        <EditIcon />
                    </button>
                    <button onClick={() => onToggleStatus(cliente)} title={isInactive ? 'Reativar Cliente' : 'Inativar Cliente'} className={`p-1 text-gray-400 hover:text-yellow-500 rounded-full transition-colors`}>
                        {isInactive ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                </div>
            </div>

            {/* Footer: Informações e Badges */}
            <div>
                 <div className="flex items-center justify-between mt-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles.badge} ${styles.text}`}>
                        {plano}
                    </span>
                    {isInactive && (
                        <span className="bg-slate-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            INATIVO
                        </span>
                    )}
                </div>
                <div className="space-y-3 mt-4 border-t border-gray-200 dark:border-slate-700 pt-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <PhoneIcon />
                        <span>{telefone}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <PlanIcon />
                        <span>Plano {plano}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

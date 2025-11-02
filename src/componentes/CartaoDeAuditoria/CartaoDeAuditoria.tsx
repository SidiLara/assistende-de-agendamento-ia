import * as React from 'react';
import { CartaoDeAuditoriaProps } from './CartaoDeAuditoria.props';
import { AcaoAuditoria } from '../../servicos/auditoria';

// --- Icons ---
const LoginIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
const CreateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UpdateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


const actionConfig: Record<AcaoAuditoria, { icon: React.ReactNode, style: string, iconBg: string }> = {
    CRIACAO: {
        icon: <CreateIcon />,
        style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        iconBg: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300'
    },
    ATUALIZACAO: {
        icon: <UpdateIcon />,
        style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-brand-blue'
    },
    EXCLUSAO: {
        icon: <DeleteIcon />,
        style: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        iconBg: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300'
    },
    LOGIN: {
        icon: <LoginIcon />,
        style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300'
    },
};

const formatadorData = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
});

export const CartaoDeAuditoria: React.FC<CartaoDeAuditoriaProps> = ({ log }) => {
    const config = actionConfig[log.acao];

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{log.usuario}</p>
                    <div className={`${config.iconBg} rounded-full p-3`}>
                        {config.icon}
                    </div>
                </div>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{log.detalhes}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.style}`}>
                    {log.acao}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatadorData.format(log.timestamp)}</p>
            </div>
        </div>
    );
};
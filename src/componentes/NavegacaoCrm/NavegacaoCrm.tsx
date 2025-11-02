import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { NavegacaoCrmProps } from './NavegacaoCrm.props';
import { LogoEmpresa } from '../LogoEmpresa';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const NavItem = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const activeClasses = "bg-blue-600 text-white";
    const inactiveClasses = "text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-dark-tertiary dark:hover:text-gray-100";

    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`
            }
        >
            {children}
        </NavLink>
    );
};

export const NavegacaoCrm = ({ theme, toggleTheme }: NavegacaoCrmProps) => {
    return (
        <aside className="w-64 bg-white dark:bg-dark-secondary flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-slate-700">
            <div className="h-20 flex items-center justify-center px-6 border-b border-gray-200 dark:border-slate-700">
                <LogoEmpresa />
                <h1 className="text-xl font-bold ml-3">CRM</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <NavItem to="/crm">Início</NavItem>
                <NavItem to="/crm/consultores">Consultores</NavItem>
                <NavItem to="/crm/clientes">Clientes</NavItem>
                <NavItem to="/crm/estatisticas">Estatísticas</NavItem>
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-tertiary"
                    aria-label="Alternar tema"
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    <span className="ml-2 text-sm font-medium">Alternar Tema</span>
                </button>
            </div>
        </aside>
    );
};

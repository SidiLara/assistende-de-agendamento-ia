import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { NavegacaoCrmProps } from './NavegacaoCrm.props';
import { LogoEmpresa } from '../LogoEmpresa';

// --- Ícones ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const CollectionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;


// --- Componentes Internos ---
const NavItem = ({ to, icon, isCollapsed, children }: { to: string; icon: React.ReactNode; isCollapsed: boolean; children: React.ReactNode }) => {
    const activeClasses = "bg-blue-600 text-white";
    const inactiveClasses = "text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-dark-tertiary dark:hover:text-gray-100";

    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''} ${isActive ? activeClasses : inactiveClasses}`
            }
        >
            {icon}
            {!isCollapsed && <span className="ml-3 font-medium">{children}</span>}
        </NavLink>
    );
};

export const NavegacaoCrm = ({ theme, toggleTheme, isCollapsed, toggleSidebar }: NavegacaoCrmProps) => {
    return (
        <aside className={`bg-white dark:bg-dark-secondary flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-slate-700 transition-all duration-300 ease-in-out fixed top-0 left-0 h-dvh z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`h-20 flex items-center px-6 border-b border-gray-200 dark:border-slate-700 ${isCollapsed ? 'justify-center' : ''}`}>
                <LogoEmpresa />
                {!isCollapsed && <h1 className="text-xl font-bold ml-3">CRM</h1>}
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <NavItem to="/crm" icon={<HomeIcon />} isCollapsed={isCollapsed}>Início</NavItem>
                <NavItem to="/crm/clientes" icon={<UsersIcon />} isCollapsed={isCollapsed}>Clientes</NavItem>
                <NavItem to="/crm/planos" icon={<CollectionIcon />} isCollapsed={isCollapsed}>Planos</NavItem>
                <NavItem to="/crm/estatisticas" icon={<ChartBarIcon />} isCollapsed={isCollapsed}>Estatísticas</NavItem>
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
                 <button
                    onClick={toggleSidebar}
                    className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-tertiary"
                    aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                    <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                        <ChevronLeftIcon />
                    </div>
                </button>
                <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-tertiary ${isCollapsed ? 'justify-center' : ''}`}
                    aria-label="Alternar tema"
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    {!isCollapsed && <span className="ml-2 text-sm font-medium">Alternar Tema</span>}
                </button>
            </div>
        </aside>
    );
};
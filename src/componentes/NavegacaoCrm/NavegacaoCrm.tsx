import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { NavegacaoCrmProps } from './NavegacaoCrm.props';
import { LogoEmpresa } from '../LogoEmpresa';

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.965 5.965 0 0112 13a5.965 5.965 0 013 1.803" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const DocumentReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

const navItems = [
    { to: "/crm", label: "Início", icon: <HomeIcon /> },
    { to: "/crm/consultores", label: "Consultores", icon: <BriefcaseIcon /> },
    { to: "/crm/clientes", label: "Clientes", icon: <UsersIcon /> },
    { to: "/crm/planos", label: "Planos", icon: <ClipboardListIcon /> },
    { to: "/crm/estatisticas", label: "Estatísticas", icon: <ChartBarIcon /> },
    { to: "/crm/auditoria", label: "Auditoria", icon: <DocumentReportIcon /> },
];

const NavItem: React.FC<{ to: string, label: string, isCollapsed: boolean, children: React.ReactNode }> = ({ to, label, isCollapsed, children }) => (
    <NavLink
        to={to}
        end={to === "/crm"}
        className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-secondary'
        }`}
    >
        {children}
        <span className={`ml-4 font-medium transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{label}</span>
    </NavLink>
);

export const NavegacaoCrm: React.FC<NavegacaoCrmProps> = ({ theme, toggleTheme, isCollapsed, toggleSidebar }) => {
    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

    return (
        <aside className={`fixed top-0 left-0 h-dvh bg-white dark:bg-dark-tertiary flex flex-col transition-all duration-300 ease-in-out z-20 shadow-lg ${sidebarWidth}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 h-16">
                {!isCollapsed && <LogoEmpresa />}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-secondary"
                    aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </button>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-2 py-4">
                {navItems.map(item => (
                    <NavItem key={item.to} to={item.to} label={item.label} isCollapsed={isCollapsed}>
                        {item.icon}
                    </NavItem>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-2 py-4 border-t border-gray-200 dark:border-slate-700">
                <button
                    onClick={toggleTheme}
                    className="flex items-center p-3 w-full rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-secondary"
                    aria-label="Alternar tema"
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    <span className={`ml-4 font-medium transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Tema</span>
                </button>
            </div>
        </aside>
    );
};

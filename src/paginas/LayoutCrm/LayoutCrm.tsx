import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { NavegacaoCrm } from '../../componentes/NavegacaoCrm';
import { useDarkMode } from '../../hooks/useDarkMode';
import { LogoEmpresa } from '../../componentes/LogoEmpresa';

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);


export const LayoutCrm: React.FC = () => {
    const { theme, toggleTheme } = useDarkMode();
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className="bg-gray-100 dark:bg-dark-primary min-h-dvh w-full flex font-sans text-gray-800 dark:text-gray-200">
            <NavegacaoCrm 
                theme={theme} 
                toggleTheme={toggleTheme} 
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out md:${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-10 bg-white dark:bg-dark-secondary shadow-sm flex items-center justify-between p-4">
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-500 dark:text-gray-400"
                        aria-label="Abrir menu"
                    >
                        <MenuIcon />
                    </button>
                    <LogoEmpresa />
                </header>
                
                <main className="p-6 md:p-10 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
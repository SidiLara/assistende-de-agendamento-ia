import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { NavegacaoCrm } from '../../componentes/NavegacaoCrm';
import { useDarkMode } from '../../hooks/useDarkMode';

export const LayoutCrm: React.FC = () => {
    const { theme, toggleTheme } = useDarkMode();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

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
            />
            {/* A div a seguir garante que a área de conteúdo se comporte corretamente com a barra lateral fixa */}
            <div className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                <main className="p-6 md:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
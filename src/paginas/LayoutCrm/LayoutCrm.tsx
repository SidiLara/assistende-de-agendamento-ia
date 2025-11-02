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
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
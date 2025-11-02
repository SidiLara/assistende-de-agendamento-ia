export interface NavegacaoCrmProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

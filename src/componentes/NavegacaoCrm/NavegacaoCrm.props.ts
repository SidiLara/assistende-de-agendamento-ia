export interface NavegacaoCrmProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}
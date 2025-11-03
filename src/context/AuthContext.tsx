import * as React from 'react';
import { AutenticacaoService, Usuario } from '../servicos/autenticacao';

interface AuthContextType {
    user: Usuario | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

// FIX: Exported AuthContext to allow it to be imported by the useAuth hook.
export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = React.useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const authService = React.useMemo(() => new AutenticacaoService(), []);

    React.useEffect(() => {
        const checkLoggedIn = () => {
            try {
                const storedUser = localStorage.getItem('crmUser');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Falha ao carregar usuário do localStorage", error);
                localStorage.removeItem('crmUser');
            } finally {
                setIsLoading(false);
            }
        };
        checkLoggedIn();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const loggedInUser = await authService.login(email, password);
            setUser(loggedInUser);
            localStorage.setItem('crmUser', JSON.stringify(loggedInUser));
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('crmUser');
        // Redireciona para a página de login.
        // O ideal é que o ProtectedRoute cuide disso, mas podemos forçar aqui também.
        window.location.href = '/login';
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

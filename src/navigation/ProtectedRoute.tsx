import * as React from 'react';
// FIX: Changed to a namespace import to address module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Você pode renderizar um spinner de carregamento aqui
        return <div>Carregando...</div>;
    }

    if (!isAuthenticated) {
        return <ReactRouterDOM.Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
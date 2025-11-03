
import { Routes, Route } from 'react-router-dom';
import { BatePapo } from '../paginas/BatePapo';
import { LayoutCrm } from '../paginas/LayoutCrm';
import { Crm } from '../paginas/Crm';
import { Clientes } from '../paginas/Clientes';
import { Planos } from '../paginas/Planos';
import { Estatisticas } from '../paginas/Estatisticas';
import { Auditoria } from '../paginas/Auditoria';
import { Login } from '../paginas/Login';
import { ProtectedRoute } from './ProtectedRoute';
import { Usuarios } from '../paginas/Usuarios';
import { Financeiro } from '../paginas/Financeiro';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<BatePapo />} />
            <Route path="/login" element={<Login />} />
            
            <Route 
                path="/crm" 
                element={
                    <ProtectedRoute>
                        <LayoutCrm />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Crm />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="planos" element={<Planos />} />
                <Route path="estatisticas" element={<Estatisticas />} />
                <Route path="auditoria" element={<Auditoria />} />
                <Route path="financeiro" element={<Financeiro />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;

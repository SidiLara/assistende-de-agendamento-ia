// FIX: Changed to a namespace import to address module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { BatePapo } from '../paginas/BatePapo';
import { LayoutCrm } from '../paginas/LayoutCrm';
import { MenuCrm } from '../paginas/MenuCrm';
import { Clientes } from '../paginas/Clientes';
import { Planos } from '../paginas/Planos';
import { Estatisticas } from '../paginas/Estatisticas';
import { Auditoria } from '../paginas/Auditoria';
import { Consultores } from '../paginas/Consultores';
import { Login } from '../paginas/Login';
import { ProtectedRoute } from './ProtectedRoute';
import { Usuarios } from '../paginas/Usuarios';

const AppRoutes = () => {
    return (
        <ReactRouterDOM.Routes>
            <ReactRouterDOM.Route path="/" element={<BatePapo />} />
            <ReactRouterDOM.Route path="/login" element={<Login />} />
            
            <ReactRouterDOM.Route 
                path="/crm" 
                element={
                    <ProtectedRoute>
                        <LayoutCrm />
                    </ProtectedRoute>
                }
            >
                <ReactRouterDOM.Route index element={<MenuCrm />} />
                <ReactRouterDOM.Route path="consultores" element={<Consultores />} />
                <ReactRouterDOM.Route path="usuarios" element={<Usuarios />} />
                <ReactRouterDOM.Route path="clientes" element={<Clientes />} />
                <ReactRouterDOM.Route path="planos" element={<Planos />} />
                <ReactRouterDOM.Route path="estatisticas" element={<Estatisticas />} />
                <ReactRouterDOM.Route path="auditoria" element={<Auditoria />} />
            </ReactRouterDOM.Route>
        </ReactRouterDOM.Routes>
    );
};

export default AppRoutes;
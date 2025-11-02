import { Routes, Route } from 'react-router-dom';
import { BatePapo } from '../paginas/BatePapo';
import { LayoutCrm } from '../paginas/LayoutCrm';
import { MenuCrm } from '../paginas/MenuCrm';
import { Clientes } from '../paginas/Clientes';
import { Estatisticas } from '../paginas/Estatisticas';
import { Planos } from '../paginas/Planos';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<BatePapo />} />
            <Route path="/crm" element={<LayoutCrm />}>
                <Route index element={<MenuCrm />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="planos" element={<Planos />} />
                <Route path="estatisticas" element={<Estatisticas />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
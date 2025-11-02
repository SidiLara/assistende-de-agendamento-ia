import { Routes, Route } from 'react-router-dom';
import { BatePapo } from '../paginas/BatePapo';
import { LayoutCrm } from '../paginas/LayoutCrm';
import { MenuCrm } from '../paginas/MenuCrm';
import { Consultores } from '../paginas/Consultores';
import { Clientes } from '../paginas/Clientes';
import { Estatisticas } from '../paginas/Estatisticas';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<BatePapo />} />
            <Route path="/crm" element={<LayoutCrm />}>
                <Route index element={<MenuCrm />} />
                <Route path="consultores" element={<Consultores />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="estatisticas" element={<Estatisticas />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;

import { Routes, Route } from 'react-router-dom';
import { BatePapo } from '../paginas/BatePapo';
import { Crm } from '../paginas/Crm';

function AppRoutes() {
return (
    <Routes>
    <Route path="/" element={<BatePapo />} />
    <Route path="/crm" element={<Crm />} />
    </Routes>
);
}

export default AppRoutes;
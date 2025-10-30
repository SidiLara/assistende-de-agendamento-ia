import { Routes, Route } from 'react-router-dom';
import { BatePapo } from '../paginas/BatePapo';

function AppRoutes() {
return (
    <Routes>
    <Route path="/" element={<BatePapo />} />
    </Routes>
);
}

export default AppRoutes;

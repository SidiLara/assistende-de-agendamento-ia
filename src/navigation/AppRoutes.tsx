import { Routes, Route } from 'react-router-dom';
import { BatePapo } from '../telas/BatePapo';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<BatePapo />} />
        </Routes>
    );
}

export default AppRoutes;

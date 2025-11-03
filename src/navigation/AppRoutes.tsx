
import { Routes, Route } from 'react-router-dom';
import { BatePapo } from '../paginas/BatePapo';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<BatePapo />} />
        </Routes>
    );
};

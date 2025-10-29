import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BatePapoPagina from '../pages/batePapo/BatePapoPagina';

function AppRoutes() {
return (
    <Routes>
    <Route path="/" element={<BatePapoPagina />} />
    </Routes>
);
}

export default AppRoutes;
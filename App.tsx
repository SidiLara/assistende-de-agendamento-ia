import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './src/routes/AppRoutes';
import './src/index.css';

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;
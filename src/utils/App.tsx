import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './src/navigation/AppRoutes';

const App = () => {
  return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
};

export default App;

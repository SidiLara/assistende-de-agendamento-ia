import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './src/navigation/AppRoutes';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
    );
};

export default App;

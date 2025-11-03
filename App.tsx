// FIX: Changed to a namespace import to address module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import AppRoutes from './src/navigation/AppRoutes';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <ReactRouterDOM.BrowserRouter>
        <AppRoutes />
      </ReactRouterDOM.BrowserRouter>
    </AuthProvider>
    );
};

export default App;
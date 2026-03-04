import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';
import FinanceiroTitulos from './pages/FinanceiroTitulos';
import Caixa from './pages/Caixa';
import CadastrosGerais from './pages/CadastrosGerais';
import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/produtos" 
            element={
              <ProtectedRoute>
                <Produtos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendas"
            element={
              <ProtectedRoute>
                <Vendas />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/financeiro/titulos"
            element={
              <ProtectedRoute>
                <FinanceiroTitulos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financeiro/caixa"
            element={
              <ProtectedRoute>
                <Caixa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/CadastrosGerais"
            element={
              <ProtectedRoute>
                <CadastrosGerais />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;

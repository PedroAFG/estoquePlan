import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import FinanceiroTitulos from "./pages/FinanceiroTitulos";
import Caixa from "./pages/Caixa";
import CadastrosGerais from "./pages/CadastrosGerais";
import CategoriasPage from "./pages/CategoriasPage";
import CategoriasFinanceirasPage from "./pages/CategoriasFinanceirasPage";
import FormasPagamentoPage from "./pages/FormasPagamentoPage";
import ClientesPage from "./pages/ClientesPage"
import Configuracoes from "./pages/Configuracoes";
import Usuarios from "./pages/Usuarios"
import AdminRoute from "./components/AdminRoute"
import RedefinirSenha from "./pages/RedefinirSenha";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider } from "./contexts/UserContext";
import EsqueciSenha from "./pages/EsqueciSenha";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

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
            path="/cadastros"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <CadastrosGerais />
                </AdminRoute>
              </ProtectedRoute>
            }
          />



          <Route
            path="/cadastros/categorias"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <CategoriasPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastros/categorias-financeiras"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <CategoriasFinanceirasPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastros/formas-pagamento"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <FormasPagamentoPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastros/clientes"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <ClientesPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastros/usuarios"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Usuarios />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/redefinir-senha"
            element={<RedefinirSenha />}
          />

          <Route
            path="/esqueci-senha"
            element={<EsqueciSenha />}
          />

          <Route path="/login" element={<Login />} />

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
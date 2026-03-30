import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

// páginas futuras dos cadastros
// import ClientesPage from "./pages/ClientesPage";
// import CategoriasPage from "./pages/CategoriasPage";
// import CategoriasFinanceirasPage from "./pages/CategoriasFinanceirasPage";
// import FormasPagamentoPage from "./pages/FormasPagamentoPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider } from "./contexts/UserContext";

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
            path="/cadastros"
            element={
              <ProtectedRoute>
                <CadastrosGerais />
              </ProtectedRoute>
            }
          />
          
          

          <Route
            path="/cadastros/categorias"
            element={
              <ProtectedRoute>
                <CategoriasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastros/categorias-financeiras"
            element={
              <ProtectedRoute>
                <CategoriasFinanceirasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastros/formas-pagamento"
            element={
              <ProtectedRoute>
                <FormasPagamentoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastros/clientes"
            element={
              <ProtectedRoute>
                <ClientesPage />
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

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
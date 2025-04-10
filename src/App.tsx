import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import GlobalStyles from './styles/GlobalStyles';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RomaneioTL from './pages/romaneios/RomaneioTL';
import RomaneioPC from './pages/romaneios/RomaneioPC';
import RomaneioPES from './pages/romaneios/RomaneioPES';
import MigrationPage from './pages/admin/MigrationPage';
import Clientes from './pages/cadastros/Clientes';
import Especies from './pages/cadastros/Especies';
import MainLayout from './components/layout/MainLayout';
import ListaOrcamentos from './pages/orcamentos/ListaOrcamentos';
import NovoOrcamento from './pages/orcamentos/NovoOrcamento';
import OrcamentosIndex from './pages/orcamentos/OrcamentosIndex';
import DadosEmpresa from './pages/configuracoes/DadosEmpresa';
import Usuarios from './pages/configuracoes/Usuarios';
import ConfiguracoesIndex from './pages/configuracoes/ConfiguracoesIndex';
import RegisterEmpresa from './pages/auth/RegisterEmpresa';

// Componente de rota privada que verifica a autenticação
interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Implementação do componente de rota privada usando o AuthContext
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

// Componente para páginas não encontradas ou em construção
const EmptyPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>Esta página está em construção ou não foi encontrada.</p>
  </div>
);

// Componente que inclui o layout principal e um outlet para as rotas aninhadas
const LayoutWithOutlet: React.FC = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const App: React.FC = () => {
  console.log("Renderizando App com as rotas definidas");
  
  return (
    <ThemeProvider>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterEmpresa />} />
            
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <LayoutWithOutlet />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* Rotas disponíveis */}
              <Route path="romaneios/tl" element={<RomaneioTL />} />
              <Route path="romaneios/pc" element={<RomaneioPC />} />
              <Route path="romaneios/pes" element={<RomaneioPES />} />
              
              {/* Cadastros */}
              <Route path="cadastros/clientes" element={<Clientes />} />
              <Route path="cadastros/especies" element={<Especies />} />
              
              {/* Página de Migração */}
              <Route path="admin/migration" element={<MigrationPage />} />
              
              {/* Orçamentos */}
              <Route path="orcamentos" element={<OrcamentosIndex />} />
              <Route path="orcamentos/lista" element={<ListaOrcamentos />} />
              <Route path="orcamentos/novo" element={<NovoOrcamento />} />
              <Route path="orcamentos/visualizar/:id" element={<NovoOrcamento />} />
              <Route path="orcamentos/editar/:id" element={<NovoOrcamento />} />
              
              {/* Configurações */}
              <Route path="configuracoes" element={<ConfiguracoesIndex />} />
              <Route path="configuracoes/empresa" element={<DadosEmpresa />} />
              <Route path="configuracoes/usuarios" element={<Usuarios />} />
              
              {/* Relatórios (placeholder temporário) */}
              <Route path="relatorios" element={<EmptyPage title="Relatórios" />} />
              
              {/* Rota de fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

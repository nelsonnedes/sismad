import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que controla o acesso a rotas protegidas
 * Verifica se o usuário está autenticado antes de renderizar o conteúdo
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Aqui seria implementada a lógica de autenticação real
  // Por exemplo, verificar um token no localStorage ou no contexto
  
  // Por enquanto, considere o usuário sempre autenticado para desenvolvimento
  const isAuthenticated = true;

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
};

export default PrivateRoute; 
import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const Header = styled.header`
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const UserAvatar = styled.div`
  width: 35px;
  height: 35px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 500;
`;

const CompanyName = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondary};
`;

const UserMenuDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  z-index: 100;
`;

const DropdownItem = styled(Link)`
  display: flex;
  padding: 10px 15px;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: background-color 0.2s;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
  
  i {
    color: ${({ theme }) => theme.colors.primary};
    width: 20px;
    text-align: center;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  width: 100%;
  padding: 10px 15px;
  color: ${({ theme }) => theme.colors.danger};
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  align-items: center;
  gap: 10px;
  text-align: left;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
  
  i {
    width: 20px;
    text-align: center;
  }
`;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { currentUser, userInfo, currentEmpresa, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // Redirecionamento para login é feito no AuthContext
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };
  
  // Obter a primeira letra do nome do usuário para o avatar
  const userInitial = userInfo?.nome ? userInfo.nome.charAt(0).toUpperCase() : 'U';
  
  return (
    <MainLayoutContainer>
      <Sidebar />
      <Content>
        <Header>
          {/* Aqui você pode adicionar título da página, breadcrumb, etc. */}
          <div>{/* Espaço para breadcrumb no futuro */}</div>
          
          {/* Menu do usuário */}
          <UserMenu>
            <UserButton onClick={toggleMenu}>
              <UserAvatar>{userInitial}</UserAvatar>
              <UserInfo>
                <UserName>{userInfo?.nome || 'Usuário'}</UserName>
                <CompanyName>{currentEmpresa?.nome || 'Empresa'}</CompanyName>
              </UserInfo>
              <i className={`fas fa-chevron-${isMenuOpen ? 'up' : 'down'}`} />
            </UserButton>
            
            <UserMenuDropdown $isOpen={isMenuOpen}>
              <DropdownItem to="/configuracoes/empresa">
                <i className="fas fa-building"></i>
                Dados da Empresa
              </DropdownItem>
              {userInfo?.tipo === 'admin' && (
                <DropdownItem to="/configuracoes/usuarios">
                  <i className="fas fa-users-cog"></i>
                  Gerenciar Usuários
                </DropdownItem>
              )}
              <DropdownItem to="/configuracoes">
                <i className="fas fa-cog"></i>
                Configurações
              </DropdownItem>
              <hr style={{ margin: '5px 0', border: 'none', borderTop: '1px solid #eee' }} />
              <LogoutButton onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Sair
              </LogoutButton>
            </UserMenuDropdown>
          </UserMenu>
        </Header>
        
        {children}
      </Content>
    </MainLayoutContainer>
  );
};

export default MainLayout; 
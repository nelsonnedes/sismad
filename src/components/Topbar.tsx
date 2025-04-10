import React from 'react';
import styled from 'styled-components';
import { ThemeType } from '../styles/theme';

interface TopbarProps {
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

interface StyledProps {
  theme: ThemeType;
}

const TopbarContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  height: 60px;
  background-color: white;
  border-bottom: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  z-index: 10;
`;

const MenuToggle = styled.button`
  background: none;
  border: none;
  color: ${(props: StyledProps) => props.theme.colors.text};
  font-size: 1.2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  
  &:hover {
    background-color: ${(props: StyledProps) => props.theme.colors.backgroundHover};
    border-radius: 50%;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  padding-left: 35px;
  border: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.sm};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${(props: StyledProps) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
  }
`;

const SearchIcon = styled.i`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props: StyledProps) => props.theme.colors.textLight};
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
`;

const UserInfo = styled.div`
  margin-right: 15px;
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const UserRole = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textLight};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textLight};
  margin-left: 5px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.backgroundHover};
    color: ${props => props.theme.colors.primary};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: ${props => props.theme.colors.danger};
  color: white;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Topbar: React.FC<TopbarProps> = ({ sidebarOpen = true, toggleSidebar }) => {
  return (
    <TopbarContainer>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <MenuToggle onClick={toggleSidebar}>
          <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
        </MenuToggle>
        <SearchContainer>
          <SearchIcon className="fas fa-search" />
          <SearchInput placeholder="Pesquisar..." />
        </SearchContainer>
      </div>
      
      <UserArea>
        <ActionButtons>
          <IconButton style={{ position: 'relative' }}>
            <i className="fas fa-bell"></i>
            <NotificationBadge>3</NotificationBadge>
          </IconButton>
          <IconButton>
            <i className="fas fa-cog"></i>
          </IconButton>
        </ActionButtons>
        
        <UserInfo>
          <UserName>Administrador</UserName>
          <UserRole>Admin</UserRole>
        </UserInfo>
        
        <UserAvatar>
          A
        </UserAvatar>
      </UserArea>
    </TopbarContainer>
  );
};

export default Topbar; 
import React from 'react';
import styled from 'styled-components';

interface TopbarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  userName?: string;
}

const Topbar: React.FC<TopbarProps> = ({ sidebarOpen, toggleSidebar, userName = 'Usuário' }) => {
  return (
    <TopbarContainer>
      <LeftSection>
        <MenuButton onClick={toggleSidebar}>
          <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </MenuButton>
        <Title>SISMAD - Sistema para Madeireiras</Title>
      </LeftSection>
      
      <RightSection>
        <SearchBar>
          <SearchInput type="text" placeholder="Pesquisar..." />
          <SearchIcon className="fas fa-search"></SearchIcon>
        </SearchBar>
        
        <IconButton>
          <i className="fas fa-bell"></i>
          <NotificationBadge>2</NotificationBadge>
        </IconButton>
        
        <UserDropdown>
          <UserAvatar>{userName.charAt(0)}</UserAvatar>
          <UserName>{userName}</UserName>
          <DropdownIcon className="fas fa-chevron-down"></DropdownIcon>
        </UserDropdown>
      </RightSection>
    </TopbarContainer>
  );
};

const TopbarContainer = styled.header`
  height: 60px;
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${props => props.theme.spacing.medium};
  box-shadow: ${props => props.theme.shadows.small};
  position: sticky;
  top: 0;
  z-index: 900;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.medium};
  cursor: pointer;
  padding: ${props => props.theme.spacing.small};
  margin-right: ${props => props.theme.spacing.small};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${props => props.theme.transitions.default};
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSizes.medium};
  margin: 0;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const SearchBar = styled.div`
  position: relative;
  margin-right: ${props => props.theme.spacing.medium};
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const SearchInput = styled.input`
  background-color: ${props => props.theme.colors.background};
  border: none;
  border-radius: ${props => props.theme.borderRadius.small};
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  padding-right: 30px;
  width: 250px;
  transition: all ${props => props.theme.transitions.default};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary};
    width: 300px;
  }
`;

const SearchIcon = styled.i`
  position: absolute;
  right: ${props => props.theme.spacing.small};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.secondary};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  position: relative;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.medium};
  cursor: pointer;
  padding: ${props => props.theme.spacing.small};
  margin-right: ${props => props.theme.spacing.medium};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${props => props.theme.transitions.default};
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: ${props => props.theme.colors.danger};
  color: white;
  font-size: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserDropdown = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: ${props => props.theme.spacing.small};
  border-radius: ${props => props.theme.borderRadius.small};
  transition: background-color ${props => props.theme.transitions.default};
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: ${props => props.theme.spacing.small};
`;

const UserName = styled.span`
  margin-right: ${props => props.theme.spacing.small};
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const DropdownIcon = styled.i`
  font-size: 12px;
  color: ${props => props.theme.colors.secondary};
`;

export default Topbar; 
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Tipos para os itens do menu
type MenuItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
  children?: MenuItem[];
};

// Props para o componente Sidebar
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

// Tipos para componentes estilizados
interface StyledProps {
  theme: {
    colors: {
      dark: string;
      light: string;
      primary: string;
      border: string;
    };
    transitions: {
      default: string;
    };
    spacing: {
      small: string;
      medium: string;
      large: string;
    };
    fontSizes: {
      small: string;
      medium: string;
      large: string;
    };
    shadows: {
      large: string;
    };
  };
  isOpen?: boolean;
  $isActive?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  // Inicializar expandedMenus com base na rota atual
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    const path = location.pathname;
    const initialExpanded: string[] = [];
    
    // Verificar qual menu deve estar expandido com base na rota atual
    if (path.includes('/cadastros/')) {
      initialExpanded.push('cadastros');
    }
    if (path.includes('/orcamentos/')) {
      initialExpanded.push('orcamentos');
    }
    if (path.includes('/romaneios/')) {
      initialExpanded.push('romaneios');
    }
    if (path.includes('/admin/')) {
      initialExpanded.push('administracao');
    }
    
    return initialExpanded;
  });

  // Atualizar expandedMenus quando a rota mudar
  useEffect(() => {
    const path = location.pathname;
    let newExpanded = [...expandedMenus];
    
    // Verificar se precisa expandir algum menu
    if (path.includes('/cadastros/') && !expandedMenus.includes('cadastros')) {
      newExpanded.push('cadastros');
    }
    if (path.includes('/orcamentos/') && !expandedMenus.includes('orcamentos')) {
      newExpanded.push('orcamentos');
    }
    if (path.includes('/romaneios/') && !expandedMenus.includes('romaneios')) {
      newExpanded.push('romaneios');
    }
    if (path.includes('/admin/') && !expandedMenus.includes('administracao')) {
      newExpanded.push('administracao');
    }
    
    if (newExpanded.length !== expandedMenus.length) {
      setExpandedMenus(newExpanded);
    }
  }, [location.pathname, expandedMenus]);

  // Menu items definition
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fa-chart-line',
      path: '/',
    },
    {
      id: 'cadastros',
      label: 'Cadastros',
      icon: 'fa-database',
      path: '/cadastros',
      children: [
        {
          id: 'clientes',
          label: 'Clientes',
          icon: 'fa-users',
          path: '/cadastros/clientes',
        },
        {
          id: 'especies',
          label: 'Espécies',
          icon: 'fa-tree',
          path: '/cadastros/especies',
        },
      ],
    },
    {
      id: 'orcamentos',
      label: 'Orçamentos',
      icon: 'fa-file-invoice-dollar',
      path: '/orcamentos',
      children: [
        {
          id: 'lista-orcamentos',
          label: 'Lista de Orçamentos',
          icon: 'fa-list',
          path: '/orcamentos/lista',
        },
        {
          id: 'novo-orcamento',
          label: 'Novo Orçamento',
          icon: 'fa-plus',
          path: '/orcamentos/novo',
        },
      ],
    },
    {
      id: 'romaneios',
      label: 'Romaneios',
      icon: 'fa-clipboard-list',
      path: '/romaneios',
      children: [
        {
          id: 'romaneio-tl',
          label: 'Romaneio Toda Largura',
          icon: 'fa-ruler',
          path: '/romaneios/tl',
        },
        {
          id: 'romaneio-pc',
          label: 'Romaneio Pacote',
          icon: 'fa-box',
          path: '/romaneios/pc',
        },
        {
          id: 'romaneio-pes',
          label: 'Romaneio Cubagem em Pés',
          icon: 'fa-ruler-combined',
          path: '/romaneios/pes',
        },
        {
          id: 'romaneio-tr',
          label: 'Romaneio Toras',
          icon: 'fa-tree',
          path: '/romaneio-tr',
        },
      ],
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: 'fa-cog',
      path: '/configuracoes',
    },
    {
      id: 'administracao',
      label: 'Administração',
      icon: 'fa-tools',
      path: '/admin',
      children: [
        {
          id: 'migracao-firebase',
          label: 'Migração Firebase',
          icon: 'fa-database',
          path: '/admin/migration',
        }
      ]
    }
  ];

  // Função para expandir/recolher submenus
  const toggleExpanded = (id: string) => {
    setExpandedMenus((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // Verifica se um item está ativo (atual)
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Verifica se um menu com filhos tem um filho ativo
  const hasActiveChild = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some((child) => {
      // Verificar se o caminho do filho está incluído no caminho atual
      return location.pathname.includes(child.path);
    });
  };

  // Verifica se um item de menu deve estar ativo com base na rota atual
  const isMenuActive = (item: MenuItem) => {
    // Para itens sem submenu
    if (!item.children) {
      return isActive(item.path);
    }
    
    // Para itens com submenu
    return hasActiveChild(item) || expandedMenus.includes(item.id);
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <Logo>SISMAD</Logo>
        <CloseButton onClick={toggleSidebar}>
          <i className="fas fa-times"></i>
        </CloseButton>
      </SidebarHeader>

      <MenuItems>
        {menuItems.map((item) => (
          <React.Fragment key={item.id}>
            {item.children ? (
              // Item com submenu
              <MenuItem>
                <MenuItemButton
                  $isActive={isMenuActive(item)}
                  onClick={() => toggleExpanded(item.id)}
                >
                  <MenuIcon className={`fas ${item.icon}`} />
                  <MenuLabel>{item.label}</MenuLabel>
                  <ExpandIcon
                    className={`fas ${
                      expandedMenus.includes(item.id)
                        ? 'fa-chevron-down'
                        : 'fa-chevron-right'
                    }`}
                  />
                </MenuItemButton>

                {expandedMenus.includes(item.id) && (
                  <SubMenu>
                    {item.children.map((child) => (
                      <SubMenuItem key={child.id}>
                        <MenuLink
                          to={child.path}
                          $isActive={isActive(child.path)}
                        >
                          <MenuIcon className={`fas ${child.icon}`} />
                          <MenuLabel>{child.label}</MenuLabel>
                        </MenuLink>
                      </SubMenuItem>
                    ))}
                  </SubMenu>
                )}
              </MenuItem>
            ) : (
              // Item sem submenu
              <MenuItem>
                <MenuLink to={item.path} $isActive={isActive(item.path)}>
                  <MenuIcon className={`fas ${item.icon}`} />
                  <MenuLabel>{item.label}</MenuLabel>
                </MenuLink>
              </MenuItem>
            )}
          </React.Fragment>
        ))}
      </MenuItems>

      <SidebarFooter>
        <FooterItem>
          <i className="fas fa-question-circle"></i>
          <span>Ajuda</span>
        </FooterItem>
        <FooterItem>
          <i className="fas fa-sign-out-alt"></i>
          <span>Sair</span>
        </FooterItem>
      </SidebarFooter>
    </SidebarContainer>
  );
};

// Styled Components
const SidebarContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 250px;
  background-color: ${(props: StyledProps) => props.theme.colors.dark};
  color: ${(props: StyledProps) => props.theme.colors.light};
  transform: ${(props: StyledProps) => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform ${(props: StyledProps) => props.theme.transitions.default};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: ${(props: StyledProps) => props.theme.shadows.large};

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${(props: StyledProps) => props.theme.spacing.medium};
  border-bottom: 1px solid ${(props: StyledProps) => props.theme.colors.border};
`;

const Logo = styled.h1`
  font-size: ${(props: StyledProps) => props.theme.fontSizes.large};
  margin: 0;
  color: ${(props: StyledProps) => props.theme.colors.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${(props: StyledProps) => props.theme.colors.light};
  font-size: ${(props: StyledProps) => props.theme.fontSizes.medium};
  cursor: pointer;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MenuItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
`;

const MenuItem = styled.li`
  border-bottom: 1px solid ${(props: StyledProps) => props.theme.colors.border};
`;

const MenuLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(props: StyledProps) => props.theme.spacing.medium};
  color: ${(props: StyledProps) => props.$isActive ? props.theme.colors.primary : props.theme.colors.light};
  text-decoration: none;
  background-color: ${(props: StyledProps) => props.$isActive ? 'rgba(13, 110, 253, 0.1)' : 'transparent'};
  transition: all ${(props: StyledProps) => props.theme.transitions.default};

  &:hover {
    background-color: rgba(13, 110, 253, 0.1);
  }
`;

const MenuItemButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(props: StyledProps) => props.theme.spacing.medium};
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: ${(props: StyledProps) => props.$isActive ? props.theme.colors.primary : props.theme.colors.light};
  cursor: pointer;
  background-color: ${(props: StyledProps) => props.$isActive ? 'rgba(13, 110, 253, 0.1)' : 'transparent'};
  transition: all ${(props: StyledProps) => props.theme.transitions.default};

  &:hover {
    background-color: rgba(13, 110, 253, 0.1);
  }
`;

const MenuIcon = styled.i`
  width: 20px;
  margin-right: ${(props: StyledProps) => props.theme.spacing.medium};
  text-align: center;
`;

const MenuLabel = styled.span`
  flex-grow: 1;
`;

const ExpandIcon = styled.i`
  font-size: 12px;
`;

const SubMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.1);
`;

const SubMenuItem = styled.li`
  padding-left: ${(props: StyledProps) => props.theme.spacing.medium};
`;

const SidebarFooter = styled.div`
  padding: ${(props: StyledProps) => props.theme.spacing.medium};
  border-top: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  display: flex;
  justify-content: space-around;
`;

const FooterItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: ${(props: StyledProps) => props.theme.colors.light};
  transition: color ${(props: StyledProps) => props.theme.transitions.default};

  i {
    font-size: ${(props: StyledProps) => props.theme.fontSizes.medium};
    margin-bottom: ${(props: StyledProps) => props.theme.spacing.small};
  }

  &:hover {
    color: ${(props: StyledProps) => props.theme.colors.primary};
  }
`;

export default Sidebar;
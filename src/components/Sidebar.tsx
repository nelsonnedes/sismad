import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { ThemeType } from '../styles/theme';

interface NavItemProps {
  to?: string;
  icon?: string;
  label?: string;
  $active?: boolean;
  $expanded?: boolean;
  hasSubMenu?: boolean;
  open?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

interface SubMenuProps {
  open: boolean;
}

interface SidebarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
}

// Interface para props de componentes estilizados
interface StyledProps {
  theme: ThemeType;
  $isOpen?: boolean;
  $active?: boolean;
  $expanded?: boolean;
}

const SidebarContainer = styled.div<{ $isOpen?: boolean }>`
  width: ${(props: StyledProps) => props.$isOpen === false ? '80px' : '250px'};
  background-color: ${(props: StyledProps) => props.theme.colors.primary};
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
`;

const Logo = styled.div`
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }
  
  span {
    display: block;
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: 5px;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li<NavItemProps>`
  cursor: pointer;
  position: relative;
  margin-bottom: 4px;
  border-left: 3px solid ${(props: StyledProps) => 
    props.$active ? 'white' : 'transparent'};
  background-color: ${(props: StyledProps) => 
    props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  list-style: none;
  
  a {
    color: ${(props: StyledProps) => 
      props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
    text-decoration: none;
    display: block;
    width: 100%;
    transition: all 0.3s;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    
    a, .menu-item {
      color: white;
    }
  }
`;

const SubMenuWrapper = styled.div<SubMenuProps>`
  display: ${(props: SubMenuProps) => props.open ? 'block' : 'none'};
  background-color: rgba(0, 0, 0, 0.15);
  border-left: 3px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: height 0.3s ease;
  
  &.active {
    display: block;
  }
`;

const ExpandIcon = styled.i<{ $open?: boolean }>`
  font-size: 14px;
  transition: transform 0.3s;
  margin-left: 5px;
  transform: ${(props: { $open?: boolean }) => props.$open ? 'rotate(90deg)' : 'rotate(0)'};
  display: inline-block;
`;

const SubMenuItem = styled.li<{ $active?: boolean }>`
  margin-top: 2px;
  margin-bottom: 2px;
  
  a {
    padding-left: 50px;
    display: flex;
    align-items: center;
    padding-top: 12px;
    padding-bottom: 12px;
    color: ${(props: StyledProps) => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
    text-decoration: none;
    transition: all 0.3s;
    border-left: 3px solid ${(props: StyledProps) => props.$active ? 'white' : 'transparent'};
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }
`;

const NavItemText = styled.span`
  flex-grow: 1;
`;

const IconWrapper = styled.i`
  display: inline-block;
  width: 20px;
  margin-right: 10px;
`;

// Estilo para o item de menu
const MenuItemStyle = createGlobalStyle`
  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    width: 100%;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: all 0.3s;
    
    &:hover {
      color: white;
    }
  }

  /* Estilo para feedback visual no clique */
  .menu-item:active {
    background-color: rgba(255, 255, 255, 0.25);
    transition: background-color 0.1s;
  }
`;

// Componente para item de navegação
const NavItemComponent: React.FC<NavItemProps> = ({ to, icon, label, $active, hasSubMenu, open }) => {
  console.log(`Renderizando NavItem: ${label}, Link: ${to}, Active: ${$active}`);
  return (
    <NavItem $active={$active}>
      <Link to={to}>
        <IconWrapper className={icon} />
        <NavItemText>{label}</NavItemText>
        {hasSubMenu && (
          <i className={`fas fa-chevron-${open ? 'down' : 'right'}`} />
        )}
      </Link>
    </NavItem>
  );
};

// Componente principal Sidebar
const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, toggleSidebar }) => {
  const location = useLocation();
  
  // Inicializar openSubMenus com base na rota atual
  const [openSubMenus, setOpenSubMenus] = useState<string[]>(() => {
    const initialOpen: string[] = [];
    
    // Verificar quais menus devem estar expandidos
    if (location.pathname.includes('/cadastros/')) {
      initialOpen.push('cadastros');
    }
    if (location.pathname.includes('/romaneios/')) {
      initialOpen.push('romaneios');
    }
    if (location.pathname.includes('/orcamentos/')) {
      initialOpen.push('orcamentos');
    }
    if (location.pathname.includes('/relatorios/')) {
      initialOpen.push('relatorios');
    }
    if (location.pathname.includes('/configuracoes/')) {
      initialOpen.push('configuracoes');
    }
    
    console.log('Estado inicial de openSubMenus:', initialOpen);
    return initialOpen;
  });

  // Log de estado após cada renderização
  console.log('Estado atual de openSubMenus:', openSubMenus);

  const isActive = (path: string) => location.pathname === path;
  const isSubActive = (paths: string[]) => {
    // Verificar se o caminho atual começa com algum dos caminhos fornecidos
    return paths.some(path => {
      // Verificar se estamos na rota exata ou em uma sub-rota
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
    });
  };

  // Função para expandir/recolher submenus
  const toggleSubMenu = (key: string, event: React.MouseEvent) => {
    // Prevenir o comportamento padrão
    event.preventDefault();
    event.stopPropagation();
    
    console.log(`Clicado no menu: ${key}`);
    
    // Valor atual
    const isCurrentlyOpen = openSubMenus.includes(key);
    console.log(`Estado atual de ${key}: ${isCurrentlyOpen ? 'aberto' : 'fechado'}`);
    
    // Atualizar diretamente, sem depender do estado anterior
    if (isCurrentlyOpen) {
      console.log(`Fechando ${key}`);
      const newState = openSubMenus.filter(menu => menu !== key);
      setOpenSubMenus(newState);
      console.log(`Novo estado após fechar ${key}:`, newState);
    } else {
      console.log(`Abrindo ${key}`);
      const newState = [...openSubMenus, key];
      setOpenSubMenus(newState);
      console.log(`Novo estado após abrir ${key}:`, newState);
    }
  };

  const isSubMenuOpen = (key: string) => openSubMenus.includes(key);

  useEffect(() => {
    // Atualizar openSubMenus quando a rota muda
    const newOpenSubMenus: string[] = [];
    
    if (location.pathname.includes('/cadastros/')) {
      newOpenSubMenus.push('cadastros');
    }
    if (location.pathname.includes('/romaneios/')) {
      newOpenSubMenus.push('romaneios');
    }
    if (location.pathname.includes('/orcamentos/')) {
      newOpenSubMenus.push('orcamentos');
    }
    if (location.pathname.includes('/relatorios/')) {
      newOpenSubMenus.push('relatorios');
    }
    if (location.pathname.includes('/configuracoes/')) {
      newOpenSubMenus.push('configuracoes');
    }
    
    // Sempre atualizar sem comparação que pode falhar
    setOpenSubMenus(newOpenSubMenus);
    
  }, [location.pathname]);

  return (
    <SidebarContainer $isOpen={isOpen}>
      <MenuItemStyle />
      <Logo>
        <h1>SISMAD</h1>
        <span>Sistema de Madeireiras</span>
      </Logo>
      
      <NavList>
        {/* Dashboard */}
        <NavItemComponent 
          to="/" 
          icon="fas fa-tachometer-alt" 
          label="Dashboard" 
          $active={isActive('/')} 
        />
        
        {/* Cadastros */}
        <NavItem 
          $active={isSubActive(['/cadastros'])} 
          $expanded={isSubMenuOpen('cadastros')}
          onClick={(e: React.MouseEvent) => toggleSubMenu('cadastros', e)}
        >
          <div className="menu-item">
            <IconWrapper className="fas fa-database" />
            <NavItemText>Cadastros</NavItemText>
            <ExpandIcon className="fas fa-chevron-right" $open={isSubMenuOpen('cadastros')} />
          </div>
        </NavItem>
        <SubMenuWrapper open={isSubMenuOpen('cadastros')} className={isSubMenuOpen('cadastros') ? 'active' : ''}>
          <NavList>
            <SubMenuItem $active={isActive('/cadastros/clientes')}>
              <Link to="/cadastros/clientes">
                <span>Clientes</span>
              </Link>
            </SubMenuItem>
            <SubMenuItem $active={isActive('/cadastros/especies')}>
              <Link to="/cadastros/especies">
                <span>Espécies</span>
              </Link>
            </SubMenuItem>
          </NavList>
        </SubMenuWrapper>
        
        {/* Romaneios */}
        <NavItem 
          $active={isSubActive(['/romaneios'])} 
          $expanded={isSubMenuOpen('romaneios')}
          onClick={(e: React.MouseEvent) => toggleSubMenu('romaneios', e)}
        >
          <div className="menu-item">
            <IconWrapper className="fas fa-file-alt" />
            <NavItemText>Romaneios</NavItemText>
            <ExpandIcon className="fas fa-chevron-right" $open={isSubMenuOpen('romaneios')} />
          </div>
        </NavItem>
        <SubMenuWrapper open={isSubMenuOpen('romaneios')} className={isSubMenuOpen('romaneios') ? 'active' : ''}>
          <NavList>
            <SubMenuItem $active={isActive('/romaneios/tl')}>
              <Link to="/romaneios/tl">
                <span>Romaneio TL</span>
              </Link>
            </SubMenuItem>
            <SubMenuItem $active={isActive('/romaneios/pc')}>
              <Link to="/romaneios/pc">
                <span>Romaneio PC</span>
              </Link>
            </SubMenuItem>
            <SubMenuItem $active={isActive('/romaneios/pes')}>
              <Link to="/romaneios/pes">
                <span>Romaneio Pés</span>
              </Link>
            </SubMenuItem>
            <SubMenuItem $active={isActive('/romaneios/tr')}>
              <Link to="/romaneios/tr">
                <span>Romaneio Toras</span>
              </Link>
            </SubMenuItem>
          </NavList>
        </SubMenuWrapper>
        
        {/* Orçamentos */}
        <NavItem 
          $active={isSubActive(['/orcamentos'])} 
          $expanded={isSubMenuOpen('orcamentos')}
          onClick={(e: React.MouseEvent) => toggleSubMenu('orcamentos', e)}
        >
          <div className="menu-item">
            <IconWrapper className="fas fa-file-invoice-dollar" />
            <NavItemText>Orçamentos</NavItemText>
            <ExpandIcon className="fas fa-chevron-right" $open={isSubMenuOpen('orcamentos')} />
          </div>
        </NavItem>
        <SubMenuWrapper open={isSubMenuOpen('orcamentos')} className={isSubMenuOpen('orcamentos') ? 'active' : ''}>
          <NavList>
            <SubMenuItem $active={isActive('/orcamentos/lista')}>
              <Link to="/orcamentos/lista">
                <span>Lista de Orçamentos</span>
              </Link>
            </SubMenuItem>
            <SubMenuItem $active={isActive('/orcamentos/novo')}>
              <Link to="/orcamentos/novo">
                <span>Novo Orçamento</span>
              </Link>
            </SubMenuItem>
          </NavList>
        </SubMenuWrapper>
        
        {/* Relatórios */}
        <NavItem 
          $active={isSubActive(['/relatorios'])} 
          $expanded={isSubMenuOpen('relatorios')}
          onClick={(e: React.MouseEvent) => toggleSubMenu('relatorios', e)}
        >
          <div className="menu-item">
            <IconWrapper className="fas fa-chart-bar" />
            <NavItemText>Relatórios</NavItemText>
            <ExpandIcon className="fas fa-chevron-right" $open={isSubMenuOpen('relatorios')} />
          </div>
        </NavItem>
        <SubMenuWrapper open={isSubMenuOpen('relatorios')} className={isSubMenuOpen('relatorios') ? 'active' : ''}>
          <NavList>
            <SubMenuItem $active={isActive('/relatorios/vendas')}>
              <Link to="/relatorios/vendas">
                <span>Relatório de Vendas</span>
              </Link>
            </SubMenuItem>
            <SubMenuItem $active={isActive('/relatorios/producao')}>
              <Link to="/relatorios/producao">
                <span>Relatório de Produção</span>
              </Link>
            </SubMenuItem>
            <SubMenuItem $active={isActive('/relatorios/financeiro')}>
              <Link to="/relatorios/financeiro">
                <span>Relatório Financeiro</span>
              </Link>
            </SubMenuItem>
          </NavList>
        </SubMenuWrapper>
        
        {/* Configurações */}
        <NavItem 
          $active={isSubActive(['/configuracoes'])} 
          $expanded={isSubMenuOpen('configuracoes')}
          onClick={(e: React.MouseEvent) => toggleSubMenu('configuracoes', e)}
        >
          <div className="menu-item">
            <IconWrapper className="fas fa-cog" />
            <NavItemText>Configurações</NavItemText>
            <ExpandIcon className="fas fa-chevron-right" $open={isSubMenuOpen('configuracoes')} />
          </div>
        </NavItem>
        <SubMenuWrapper open={isSubMenuOpen('configuracoes')} className={isSubMenuOpen('configuracoes') ? 'active' : ''}>
          <NavList>
            <SubMenuItem $active={isActive('/configuracoes/empresa')}>
              <Link to="/configuracoes/empresa">
                <span>Dados da Empresa</span>
              </Link>
            </SubMenuItem>
            <SubMenuItem $active={isActive('/configuracoes/usuarios')}>
              <Link to="/configuracoes/usuarios">
                <span>Usuários</span>
              </Link>
            </SubMenuItem>
            <SubMenuItem $active={isActive('/configuracoes/sistema')}>
              <Link to="/configuracoes/sistema">
                <span>Sistema</span>
              </Link>
            </SubMenuItem>
          </NavList>
        </SubMenuWrapper>
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar; 
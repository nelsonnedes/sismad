import React, { useEffect, useState } from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, IconButton, Drawer, Menu, MenuItem } from '@material-ui/core';
import { Hidden as MuiHidden } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { useHistory, useLocation } from 'react-router-dom';
import MenuList from './MenuList';
import { useAuth } from '../../context/AuthContext';
import { getPageTitle, getPageIcon } from '../../utils/pages';
import logo from '../../assets/images/logo.png';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    drawer: {
      width: 240,
      flexShrink: 0,
    },
    drawerPaper: {
      width: 240,
    },
    toolbar: theme.mixins.toolbar,
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    logo: {
      height: 40,
      marginRight: theme.spacing(2),
    },
    userMenuButton: {
      marginLeft: theme.spacing(2),
    },
    empresa: {
      fontSize: '0.8rem',
      opacity: 0.8,
      marginTop: -5,
    },
  }),
);

const AppBar: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [title, setTitle] = useState('');
  const { currentUser, logout, currentEmpresa } = useAuth();
  
  // Estado para controlar a exibição baseada na largura da tela
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar se a tela é móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 960);
    };
    
    // Verificar imediatamente e também adicionar ouvinte para mudanças de tamanho
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Limpar o ouvinte ao desmontar
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Adiciona dados da empresa em elemento oculto para recuperação durante impressão
  useEffect(() => {
    try {
      if (currentEmpresa) {
        // Remover elemento existente se houver
        const existingElement = document.getElementById('empresa-data');
        if (existingElement) {
          existingElement.remove();
        }
        
        // Criar novo elemento com dados atualizados
        const empresaDataElement = document.createElement('div');
        empresaDataElement.id = 'empresa-data';
        empresaDataElement.style.display = 'none';
        empresaDataElement.setAttribute('data-empresa', JSON.stringify(currentEmpresa));
        
        // Adicionar ao corpo do documento
        document.body.appendChild(empresaDataElement);
        console.log('Dados da empresa atual adicionados ao DOM para impressão');
      }
    } catch (error) {
      console.error('Erro ao adicionar dados da empresa ao DOM:', error);
    }
  }, [currentEmpresa]);

  // Atualiza o título com base na rota atual
  useEffect(() => {
    const newTitle = getPageTitle(location.pathname);
    setTitle(newTitle);
  }, [location]);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
      history.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    history.push('/configuracoes/perfil');
  };

  // Adiciona classe company-name e empresa-nome ao título da empresa para acesso via DOM
  const renderEmpresaNome = () => {
    if (!currentEmpresa) return null;
    return (
      <div className="empresa-info">
        <Typography variant="subtitle2" className={`empresa-nome ${classes.empresa}`}>
          {currentEmpresa.nome}
        </Typography>
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <MuiAppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          {/* Mobile menu icon */}
          {isMobile && (
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={handleMenuToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <div className={`${classes.logoContainer} company-logo`}>
            <img src={logo} alt="Logo" className={classes.logo} />
          </div>
          
          <Typography variant="h6" className={`${classes.title} company-name`}>
            {title}
            {renderEmpresaNome()}
          </Typography>
          
          {currentUser && (
            <div>
              <IconButton
                className={classes.userMenuButton}
                aria-label="conta do usuário"
                aria-controls="menu-usuario"
                aria-haspopup="true"
                onClick={handleUserMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-usuario"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>Perfil</MenuItem>
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </MuiAppBar>
      
      {/* Drawer apenas para dispositivos móveis */}
      {isMobile && (
        <Drawer
          className={classes.drawer}
          variant="temporary"
          open={menuOpen}
          onClose={handleMenuClose}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <div className={classes.toolbar} />
          <MenuList onItemClick={handleMenuClose} />
        </Drawer>
      )}
      
      <div className={classes.toolbar} />
    </div>
  );
};

export default AppBar; 
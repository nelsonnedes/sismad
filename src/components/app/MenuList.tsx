import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  makeStyles,
  createStyles,
  Theme,
  Collapse,
  ListSubheader
} from '@material-ui/core';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  ListAlt as ListAltIcon,
  Eco as EcoIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Business as BusinessIcon,
  People as PeopleIcon,
  AccountCircle as AccountCircleIcon
} from '@material-ui/icons';
import { useHistory, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    active: {
      backgroundColor: theme.palette.action.selected,
    },
  }),
);

interface MenuListProps {
  onItemClick?: () => void;
}

const MenuList: React.FC<MenuListProps> = ({ onItemClick }) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [open, setOpen] = React.useState({
    romaneios: false,
    orcamentos: false,
    especies: false,
    clientes: false,
    configuracoes: false
  });

  const handleClick = (section: keyof typeof open) => {
    setOpen({
      ...open,
      [section]: !open[section]
    });
  };

  const navigateTo = (path: string) => {
    history.push(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          SISMAD
        </ListSubheader>
      }
      className={classes.root}
    >
      <ListItem 
        button 
        onClick={() => navigateTo('/dashboard')}
        className={isCurrentPath('/dashboard') ? classes.active : ''}
      >
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      
      <Divider />
      
      {/* Romaneios */}
      <ListItem button onClick={() => handleClick('romaneios')}>
        <ListItemIcon>
          <ListAltIcon />
        </ListItemIcon>
        <ListItemText primary="Romaneios" />
        {open.romaneios ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open.romaneios} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/romaneios/tl') ? classes.active : ''}`}
            onClick={() => navigateTo('/romaneios/tl')}
          >
            <ListItemText primary="Tábua/Lâmina" />
          </ListItem>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/romaneios/pc') ? classes.active : ''}`}
            onClick={() => navigateTo('/romaneios/pc')}
          >
            <ListItemText primary="Pacote" />
          </ListItem>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/romaneios/tr') ? classes.active : ''}`}
            onClick={() => navigateTo('/romaneios/tr')}
          >
            <ListItemText primary="Toras" />
          </ListItem>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/romaneios/lista') ? classes.active : ''}`}
            onClick={() => navigateTo('/romaneios/lista')}
          >
            <ListItemText primary="Lista de Romaneios" />
          </ListItem>
        </List>
      </Collapse>
      
      {/* Orçamentos */}
      <ListItem button onClick={() => handleClick('orcamentos')}>
        <ListItemIcon>
          <DescriptionIcon />
        </ListItemIcon>
        <ListItemText primary="Orçamentos" />
        {open.orcamentos ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open.orcamentos} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/orcamentos/novo') ? classes.active : ''}`}
            onClick={() => navigateTo('/orcamentos/novo')}
          >
            <ListItemText primary="Novo Orçamento" />
          </ListItem>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/orcamentos/lista') ? classes.active : ''}`}
            onClick={() => navigateTo('/orcamentos/lista')}
          >
            <ListItemText primary="Lista de Orçamentos" />
          </ListItem>
        </List>
      </Collapse>
      
      {/* Clientes */}
      <ListItem button onClick={() => handleClick('clientes')}>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Clientes" />
        {open.clientes ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open.clientes} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/clientes/novo') ? classes.active : ''}`}
            onClick={() => navigateTo('/clientes/novo')}
          >
            <ListItemText primary="Novo Cliente" />
          </ListItem>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/clientes/lista') ? classes.active : ''}`}
            onClick={() => navigateTo('/clientes/lista')}
          >
            <ListItemText primary="Lista de Clientes" />
          </ListItem>
        </List>
      </Collapse>
      
      {/* Espécies */}
      <ListItem button onClick={() => handleClick('especies')}>
        <ListItemIcon>
          <EcoIcon />
        </ListItemIcon>
        <ListItemText primary="Espécies" />
        {open.especies ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open.especies} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/especies/nova') ? classes.active : ''}`}
            onClick={() => navigateTo('/especies/nova')}
          >
            <ListItemText primary="Nova Espécie" />
          </ListItem>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/especies/lista') ? classes.active : ''}`}
            onClick={() => navigateTo('/especies/lista')}
          >
            <ListItemText primary="Lista de Espécies" />
          </ListItem>
        </List>
      </Collapse>
      
      <Divider />
      
      {/* Configurações */}
      <ListItem button onClick={() => handleClick('configuracoes')}>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Configurações" />
        {open.configuracoes ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open.configuracoes} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/configuracoes/empresa') ? classes.active : ''}`}
            onClick={() => navigateTo('/configuracoes/empresa')}
          >
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText primary="Empresa" />
          </ListItem>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/configuracoes/usuarios') ? classes.active : ''}`}
            onClick={() => navigateTo('/configuracoes/usuarios')}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Usuários" />
          </ListItem>
          <ListItem 
            button 
            className={`${classes.nested} ${isCurrentPath('/configuracoes/perfil') ? classes.active : ''}`}
            onClick={() => navigateTo('/configuracoes/perfil')}
          >
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Meu Perfil" />
          </ListItem>
        </List>
      </Collapse>
    </List>
  );
};

export default MenuList; 
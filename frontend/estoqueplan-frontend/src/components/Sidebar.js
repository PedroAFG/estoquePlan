import React, { useState } from 'react';
import './Sidebar.css';
import { List, ListItem, ListItemIcon, ListItemText, IconButton, Typography } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import HomeIcon from '@mui/icons-material/Home';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import ReportIcon from '@mui/icons-material/Report';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

const menuItems = [
  { text: 'Dashboard', icon: <HomeIcon />, to: '/dashboard' },
  { text: 'Produtos', icon: <Inventory2Icon />, to: '/produtos' },
  { text: 'Vendas', icon: <ReceiptLongIcon /> },
  { text: 'Clientes', icon: <PeopleIcon /> },
  { text: 'Configurações', icon: <SettingsIcon /> },
  { text: 'Relatórios', icon: <ReportIcon /> },
  { text: 'Compras', icon: <ShoppingCartIcon /> },
  { text: 'Sair', icon: <LogoutIcon /> },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);  

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <InsertDriveFileIcon className="sidebar-logo" />
        {!collapsed && (
          <Typography variant="h6" className="sidebar-title">
            estoquePlan
          </Typography>
        )}
        <IconButton
          className="sidebar-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          size="small"
        >
          {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>
      </div>
      <List className="sidebar-list">
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            className={`sidebar-list-item${item.selected ? ' selected' : ''}`}
            component={Link}
            to={item.to}
          >
            <ListItemIcon className="sidebar-list-icon">{item.icon}</ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ className: 'sidebar-list-text' }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;
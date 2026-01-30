import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import apiService from '../services/api';
import { useUser } from '../contexts/UserContext';

function Header() {
  const navigate = useNavigate();
  const { clearUser } = useUser();

  const handleLogout = async () => {
    try {
      // Chamar o endpoint de logout do backend
      await apiService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar o estado local do usuário
      clearUser();
      // Redirecionar para login
      navigate('/');
    }
  };

  return (
    <AppBar position="static" sx={{ background: '#24292f' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          EstoquePlan
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/produtos')}
          >
            Produtos
          </Button>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Sair
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
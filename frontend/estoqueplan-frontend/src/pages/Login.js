import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import apiService from '../services/api';
import { useUser } from '../contexts/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { setUserFromLogin } = useUser();
  const [formData, setFormData] = useState({
    login: '',
    senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.login || !formData.senha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await apiService.login(formData.login, formData.senha);
      
      // O JWT é enviado automaticamente em cookie HttpOnly pelo backend
      // Usamos os dados do usuário retornados no body da resposta
      setUserFromLogin(userData);
      
      // Redirecionar para o dashboard
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <Box className="login-card shadow-lg rounded-4">
        <SignalCellularAltIcon className="login-icon" fontSize="large" />
        <Typography variant="h4" className="login-title" gutterBottom>
          estoquePlan
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            className="login-input"
            label="Email"
            name="login"
            type="email"
            value={formData.login}
            onChange={handleInputChange}
            variant="filled"
            fullWidth
            disabled={loading}
            InputProps={{ disableUnderline: true }}
          />
          <TextField
            className="login-input"
            label="Senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleInputChange}
            variant="filled"
            fullWidth
            disabled={loading}
            InputProps={{ disableUnderline: true }}
          />
          <Button
            className="login-btn"
            variant="contained"
            fullWidth
            size="large"
            type="submit"
            disabled={loading}
            sx={{ position: 'relative' }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                Entrando...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
        
        <Typography className="login-forgot" variant="body2">
          Esqueceu sua senha?
        </Typography>
      </Box>
    </div>
  );
};

export default Login;
import React from 'react';
import './Login.css';
import { Box, TextField, Button, Typography } from '@mui/material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

const Login = () => {
  return (
    <div className="login-bg">
      <Box className="login-card shadow-lg rounded-4">
        <SignalCellularAltIcon className="login-icon" fontSize="large" />
        <Typography variant="h4" className="login-title" gutterBottom>
          estoquePlan
        </Typography>
        <TextField
          className="login-input"
          label="Usuário"
          variant="filled"
          fullWidth
          InputProps={{ disableUnderline: true }}
        />
        <TextField
          className="login-input"
          label="Senha"
          type="password"
          variant="filled"
          fullWidth
          InputProps={{ disableUnderline: true }}
        />
        <Button
          className="login-btn"
          variant="contained"
          fullWidth
          size="large"
        >
          Login
        </Button>
        <Typography className="login-forgot" variant="body2">
          Esqueceu sua senha?
        </Typography>
      </Box>
    </div>
  );
};

export default Login;
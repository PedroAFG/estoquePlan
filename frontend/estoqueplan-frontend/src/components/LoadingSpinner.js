import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Carregando...' }) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="400px"
      gap={2}
    >
      <CircularProgress size={60} sx={{ color: '#ffd600' }} />
      <Typography variant="body1" color="#aaa">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner; 
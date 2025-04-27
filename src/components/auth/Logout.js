// frontend/src/components/auth/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Typography, Box, CircularProgress } from '@mui/material';

const Logout = () => {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logout(); // Ahora incluye el registro de auditoría
      setCurrentUser(null);
      navigate('/login');
    };
    
    performLogout();
  }, [setCurrentUser, navigate]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          Cerrando sesión...
        </Typography>
      </Box>
    </Container>
  );
};

export default Logout;
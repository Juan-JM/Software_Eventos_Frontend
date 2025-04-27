// frontend/src/components/auth/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import api from '../../services/api'; // Importar api


const Logout = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      if (currentUser) {
        // Registrar el evento de logout en la bitácora personalizada (opcional)
        try {
          await api.post('audit/custom-log/', {
            action: 'LOGOUT',
            model: 'Auth',
            detail: `Cierre de sesión del usuario ${currentUser.username}`
          });
        } catch (logError) {
          console.error('Error registrando el logout:', logError);
        }
      }
      
      logout();
      setCurrentUser(null);
      navigate('/login');
    };
    
    performLogout();
  }, [currentUser, setCurrentUser, navigate]);

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
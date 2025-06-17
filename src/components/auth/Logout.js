// frontend/src/components/auth/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Typography, Box, CircularProgress, Paper } from '@mui/material';
import { EventNote, ExitToApp } from '@mui/icons-material';

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
    <Box
      sx={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Header con branding */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 4,
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '150px',
                height: '150px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(50%, -50%)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <EventNote sx={{ fontSize: 60, color: '#fbbf24', mb: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #fbbf24, #ffffff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                PlanitOne
              </Typography>
            </Box>
          </Box>

          {/* Contenido */}
          <Box 
            sx={{ 
              p: 6,
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex'
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: '#667eea',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ExitToApp 
                    sx={{ 
                      fontSize: 24, 
                      color: '#667eea',
                      animation: 'pulse 2s infinite'
                    }} 
                  />
                </Box>
              </Box>
            </Box>

            <Typography 
              variant="h5" 
              component="h1"
              sx={{ 
                fontWeight: 600,
                color: '#1f2937',
                mb: 2
              }}
            >
              Cerrando sesión...
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#6b7280',
                mb: 3
              }}
            >
              Gracias por usar PlanitOne
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#9ca3af',
                fontStyle: 'italic'
              }}
            >
              Redirigiendo al inicio de sesión
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Animación CSS */}
      <style>
        {`
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Logout;
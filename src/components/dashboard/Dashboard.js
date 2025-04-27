// frontend/src/components/dashboard/Dashboard.js
import React from 'react';
import { Container, Typography, Paper, Box, Divider } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 6, mb: 6 }}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            backgroundColor: '#f9f9f9',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              textAlign: 'left',
              color: '#333',
              mb: 1,
            }}
          >
            Bienvenido a PlanitOne
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="body1"
            sx={{
              textAlign: 'left',
              fontSize: '1rem',
              color: '#555',
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
          >
            PlanitOne es tu aliado en la organización y gestión de eventos. Desde reuniones pequeñas hasta grandes conferencias, podrás planificar, asignar tareas, y mantener a todos los involucrados al tanto. 
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 3,
              fontStyle: 'italic',
              color: '#888',
            }}
          >
            ¡Nos alegra tenerte de vuelta!
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;

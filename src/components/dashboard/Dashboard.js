// frontend/src/components/dashboard/Dashboard.js
import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  EventNote,
  Groups,
  Assignment,
  Celebration
} from '@mui/icons-material';
// import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  // const { currentUser } = useAuth();

  const features = [
    {
      icon: <EventNote sx={{ fontSize: 40, color: '#6366f1' }} />,
      title: 'Planificación',
      description: 'Organiza eventos desde reuniones hasta conferencias'
    },
    {
      icon: <Assignment sx={{ fontSize: 40, color: '#10b981' }} />,
      title: 'Gestión de Tareas',
      description: 'Asigna y da seguimiento a todas las actividades'
    },
    {
      icon: <Groups sx={{ fontSize: 40, color: '#f59e0b' }} />,
      title: 'Colaboración',
      description: 'Mantén a todo el equipo informado y coordinado'
    },
    {
      icon: <Celebration sx={{ fontSize: 40, color: '#ef4444' }} />,
      title: 'Eventos Exitosos',
      description: 'Logra resultados extraordinarios en cada evento'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        {/* Header Principal */}
        <Paper
          elevation={6}
          sx={{
            p: 5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EventNote sx={{ fontSize: 50, mr: 2, color: '#fbbf24' }} />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #fbbf24, #ffffff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Bienvenido a PlanitOne
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 300,
                opacity: 0.95,
                maxWidth: '700px',
                lineHeight: 1.6,
                mb: 2
              }}
            >
              PlanitOne es tu aliado en la organización y gestión de eventos. Desde reuniones pequeñas hasta grandes conferencias, podrás planificar, asignar tareas, y mantener a todos los involucrados al tanto.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontStyle: 'italic',
                opacity: 0.8,
                fontSize: '1.1rem'
              }}
            >
              ¡Nos alegra tenerte de vuelta!
            </Typography>
          </Box>
        </Paper>

        {/* Tarjetas de características */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 600,
              color: '#1f2937',
              mb: 4,
              textAlign: 'center'
            }}
          >
            Todo lo que necesitas para eventos perfectos
          </Typography>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease-in-out',
                    border: '1px solid #e5e7eb',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      borderColor: '#6366f1',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        color: '#1f2937',
                        mb: 1
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        lineHeight: 1.5
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Sección adicional de motivación */}
        <Paper
          sx={{
            mt: 6,
            p: 4,
            background: 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#374151',
              mb: 2
            }}
          >
            ¿Listo para crear eventos memorables?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Con PlanitOne, cada evento se convierte en una experiencia perfectamente organizada. 
            Comienza a planificar, organizar y ejecutar eventos que dejarán una impresión duradera.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
// frontend/src/components/subscription/SubscriptionSuccess.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, Typography, 
  Container, CircularProgress
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useSubscription } from '../../contexts/SubscriptionContext';

const SubscriptionSuccess = () => {
  const { refreshSubscription, loading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    // Actualizar la información de la suscripción
    refreshSubscription();
  }, []);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleViewSubscription = () => {
    navigate('/subscription');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            ¡Suscripción Exitosa!
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Su pago ha sido procesado correctamente y su suscripción está ahora activa.
            Ya puede acceder a todas las funcionalidades del sistema.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleGoToDashboard}>
              Ir al Dashboard
            </Button>
            <Button variant="outlined" color="primary" onClick={handleViewSubscription}>
              Ver Detalles de Suscripción
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubscriptionSuccess;
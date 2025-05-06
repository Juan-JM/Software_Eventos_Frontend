// frontend/src/components/subscription/SubscriptionRequired.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography,
  Container
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

const SubscriptionRequired = () => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/subscription/plans');
  };

  const handleViewSubscription = () => {
    navigate('/subscription');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <LockOutlined color="error" sx={{ fontSize: 80, mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            Suscripción Requerida
          </Typography>
          
          <Typography variant="body1" paragraph>
            Para acceder a esta funcionalidad, necesita tener una suscripción activa.
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Actualmente su empresa no cuenta con una suscripción activa o esta ha expirado.
            Por favor, adquiera un plan para continuar.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSubscribe}>
              Ver Planes
            </Button>
            <Button variant="outlined" color="primary" onClick={handleViewSubscription}>
              Ver Estado de Suscripción
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubscriptionRequired;
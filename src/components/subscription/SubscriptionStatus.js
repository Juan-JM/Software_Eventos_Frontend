// frontend/src/components/subscription/SubscriptionStatus.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, Typography, 
  Container, Grid, CircularProgress, Alert
} from '@mui/material';
import { CheckCircle, Cancel, AccessTime } from '@mui/icons-material';
import { useSubscription } from '../../contexts/SubscriptionContext';

const SubscriptionStatus = () => {
  const { subscription, loading, error, refreshSubscription } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    refreshSubscription();
  }, []);

  const handleSubscribe = () => {
    navigate('/subscription/plans');
  };

  const handleRenew = () => {
    navigate('/subscription/plans');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Estado de Suscripción
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          {subscription?.active ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Suscripción Activa
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Plan:</strong> {subscription.plan_type === 'monthly' ? 'Mensual' : 
                    subscription.plan_type === 'biannual' ? 'Semestral' : 
                    subscription.plan_type === 'annual' ? 'Anual' : subscription.plan_type}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Estado:</strong> {subscription.status === 'active' ? 'Activa' : 
                    subscription.status === 'past_due' ? 'Pago Pendiente' : 
                    subscription.status === 'canceled' ? 'Cancelada' : 
                    subscription.status === 'expired' ? 'Expirada' : subscription.status}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Fecha de inicio:</strong> {new Date(subscription.start_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Fecha de finalización:</strong> {new Date(subscription.end_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <AccessTime color="info" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <strong>Días restantes:</strong> {subscription.days_remaining}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box mt={2}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleRenew}
                  >
                    Renovar Suscripción
                  </Button>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <Cancel color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Sin Suscripción Activa
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  Actualmente no dispone de una suscripción activa.
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Necesita suscribirse a un plan para acceder a las funcionalidades del sistema.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box mt={2}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSubscribe}
                  >
                    Suscribirse Ahora
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubscriptionStatus;
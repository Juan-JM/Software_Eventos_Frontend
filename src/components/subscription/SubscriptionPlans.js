// frontend/src/components/subscription/SubscriptionPlans.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardActions, CardContent, CardHeader,
  Container, CircularProgress, Grid, Typography, Alert
} from '@mui/material';
import { createCheckoutSession } from '../../services/subscription.service';

const SubscriptionPlans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const plans = [
    {
      id: 'monthly',
      title: 'Plan Mensual',
      price: '$19.99',
      description: 'Acceso a todas las funcionalidades por 1 mes',
      features: [
        'Gestión de eventos',
        'Gestión de locaciones',
        'Gestión de servicios',
        'Usuarios ilimitados'
      ],
      highlighted: false
    },
    {
      id: 'biannual',
      title: 'Plan Semestral',
      price: '$99.99',
      description: 'Acceso a todas las funcionalidades por 6 meses',
      features: [
        'Gestión de eventos',
        'Gestión de locaciones',
        'Gestión de servicios',
        'Usuarios ilimitados',
        'Ahorro del 17% sobre el plan mensual'
      ],
      highlighted: true
    },
    {
      id: 'annual',
      title: 'Plan Anual',
      price: '$179.99',
      description: 'Acceso a todas las funcionalidades por 12 meses',
      features: [
        'Gestión de eventos',
        'Gestión de locaciones',
        'Gestión de servicios',
        'Usuarios ilimitados',
        'Ahorro del 25% sobre el plan mensual'
      ],
      highlighted: false
    }
  ];

  const handleSelectPlan = async (planType) => {
    setLoading(true);
    setError(null);
    
    try {
      // URLs para redirigir después del pago
      const successUrl = `${window.location.origin}/subscription/success`;
      const cancelUrl = `${window.location.origin}/subscription/plans`;
      
      const result = await createCheckoutSession(planType, successUrl, cancelUrl);
      
      // Redirigir a la página de checkout de Stripe
      window.location.href = result.checkout_url;
    } catch (err) {
      console.error('Error al procesar la solicitud de suscripción:', err);
      setError(err.response?.data?.error || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Planes de Suscripción
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {plans.map((plan) => (
          <Grid item key={plan.id} xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: plan.highlighted ? '2px solid #3f51b5' : 'none',
                boxShadow: plan.highlighted ? '0 8px 16px rgba(63, 81, 181, 0.2)' : undefined
              }}
            >
              <CardHeader
                title={plan.title}
                titleTypographyProps={{ align: 'center', variant: 'h5' }}
                sx={{
                  backgroundColor: plan.highlighted ? '#3f51b5' : 'grey.200',
                  color: plan.highlighted ? 'white' : 'text.primary'
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography component="h2" variant="h3" color="text.primary">
                    {plan.price}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {plan.description}
                  </Typography>
                </Box>
                <ul>
                  {plan.features.map((feature) => (
                    <Typography component="li" variant="subtitle1" align="left" key={feature} sx={{ mb: 1 }}>
                      {feature}
                    </Typography>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant={plan.highlighted ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Seleccionar'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SubscriptionPlans;
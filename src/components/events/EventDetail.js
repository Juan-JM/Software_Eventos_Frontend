import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Button, Typography, Card, CardContent, CardMedia,
  Grid, Chip, CircularProgress, Divider, Paper, List, ListItem,
  ListItemText
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import api from '../../services/api';

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packageLoading, setPackageLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar los detalles del evento
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`events/${id}/`);
        setEvent(response.data);
        setError(null);
        
        // Si el evento tiene un paquete, cargamos los detalles del paquete
        if (response.data.is_package && response.data.package) {
          fetchPackageDetails(response.data.package.id);
        }
      } catch (err) {
        setError('Error al cargar el evento: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);
  
  // Función para cargar los detalles del paquete
  const fetchPackageDetails = async (packageId) => {
    try {
      setPackageLoading(true);
      const response = await api.get(`packages/${packageId}/`);
      setPackageDetails(response.data);
    } catch (err) {
      console.error('Error al cargar detalles del paquete:', err);
    } finally {
      setPackageLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button component={Link} to="/events" sx={{ mt: 2 }}>
          Volver a la lista
        </Button>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No se encontró el evento.</Typography>
        <Button component={Link} to="/events" sx={{ mt: 2 }}>
          Volver a la lista
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'info',
      'in_progress': 'warning',
      'completed': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'scheduled': 'Programado',
      'in_progress': 'En curso',
      'completed': 'Finalizado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  // Renderizar servicios o paquete según corresponda
  const renderServicesOrPackage = () => {
    if (event.is_package) {
      // Si es un paquete, mostramos información del paquete y sus servicios
      return (
        <Box>
          <Typography variant="h6" sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 1 }} />
            Paquete de servicios
          </Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label="Paquete" 
                color="primary" 
                size="small" 
                sx={{ mr: 2 }} 
              />
              <Typography variant="h6">
                {event.package ? event.package.name : 'Sin paquete asignado'}
              </Typography>
            </Box>
            {event.package && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {event.package.description}
              </Typography>
            )}
            
            {/* Mostrar los servicios incluidos en el paquete */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Servicios incluidos en este paquete:
              </Typography>
              
              {packageLoading ? (
                <Box sx={{ display: 'flex', p: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography>Cargando servicios...</Typography>
                </Box>
              ) : packageDetails && packageDetails.services && packageDetails.services.length > 0 ? (
                <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                  {packageDetails.services.map((service) => (
                    <React.Fragment key={service.id}>
                      <ListItem>
                        <ListItemText 
                          primary={service.name} 
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ p: 1 }}>
                  Este paquete no incluye servicios o no se pudieron cargar.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      );
    } else {
      // Si son servicios individuales
      return (
        <Box>
          <Typography variant="h6" sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 1 }} />
            Servicios contratados
          </Typography>
          <Paper elevation={1}>
            {Array.isArray(event.services) && event.services.length > 0 ? (
              <List>
                {event.services.map((service) => (
                  <React.Fragment key={service.id}>
                    <ListItem>
                      <ListItemText 
                        primary={service.name} 
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography>No hay servicios asignados a este evento.</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">{event.name}</Typography>
        <Box>
          <Button 
            component={Link} 
            to={`/events/${id}/edit`} 
            variant="outlined" 
            color="primary" 
            sx={{ mr: 1 }}
          >
            Editar
          </Button>
          <Button 
            component={Link} 
            to="/events" 
            variant="contained"
          >
            Volver
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        {event.image && (
          <CardMedia
            component="img"
            height="300"
            image={event.image}
            alt={event.name}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip 
              label={getStatusLabel(event.status)} 
              color={getStatusColor(event.status)} 
              size="medium" 
            />
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {event.description}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1 }} />
                Fechas del evento
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Inicio:</strong> {formatearFecha(event.start_date)}
                </Typography>
                <Typography variant="body1">
                  <strong>Fin:</strong> {formatearFecha(event.end_date)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 1 }} />
                Ubicación
              </Typography>
              
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1">
                  {event.location ? event.location.name : 'Sin locación asignada'}
                </Typography>
                <Typography variant="body1">
                  {event.location ? event.location.address : 'Sin locación asignada'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Información adicional */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cantidad de asistentes
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1">
                  {event.attendee_count || 0} personas
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cliente
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                {event.owner ? (
                  <Box>
                    <Typography variant="body1">
                      <strong>Nombre:</strong> {event.owner.first_name} {event.owner.last_name}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Email:</strong> {event.owner.email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Teléfono:</strong> {event.owner.phone || 'No disponible'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Dirección:</strong> {event.owner.address || 'No disponible'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1">Sin cliente asignado</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          {/* Renderizar la sección de servicios o paquete */}
          {renderServicesOrPackage()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventDetail;

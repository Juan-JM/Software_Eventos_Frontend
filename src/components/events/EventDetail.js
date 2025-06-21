import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, CircularProgress, 
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from '@mui/material';
import api from '../../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await api.get(`events/${id}/`);
        setEvent(response.data);
      } catch (err) {
        setError('Error al cargar el evento: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`events/${id}/`);
      navigate('/events');
    } catch (err) {
      setError('Error al eliminar el evento: ' + err.message);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const renderStatus = (status) => {
    const statuses = {
      'scheduled': 'Programado',
      'in_progress': 'En curso',
      'completed': 'Finalizado',
      'cancelled': 'Cancelado'
    };
    return statuses[status] || status;
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
          Volver a la lista de eventos
        </Button>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Evento no encontrado</Typography>
        <Button component={Link} to="/events" sx={{ mt: 2 }}>
          Volver a la lista de eventos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Detalle del Evento</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link} 
            to={`/events/${id}/edit`}
            sx={{ mr: 1 }}
          >
            Editar
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleDeleteClick}
          >
            Eliminar
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5">{event.name}</Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Descripción</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{event.description}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Fecha de inicio</Typography>
            <Typography variant="body1">{new Date(event.start_date).toLocaleString()}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Fecha de fin</Typography>
            <Typography variant="body1">{new Date(event.end_date).toLocaleString()}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Cantidad de asistentes</Typography>
            <Typography variant="body1">{event.attendee_count}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Locación</Typography>
            <Typography variant="body1">{event.location?.name || 'Sin locación'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Estado</Typography>
            <Typography variant="body1">{renderStatus(event.status)}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {/* <Typography variant="subtitle1" color="textSecondary">Cliente</Typography>
            <Typography variant="body1">
              {event.owner
                ? `${event.owner.first_name} ${event.owner.last_name} (${event.owner.email})`
                : 'Sin cliente asignado'}
            </Typography> */}
            <Typography variant="subtitle1" color="textSecondary">Cliente</Typography>
              {event.owner ? (
                <Box sx={{ mt: 1 }}>
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

          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Servicios asociados</Typography>
             {Array.isArray(event.services) && event.services.length > 0 ? (
                <ul>
                    {event.services.map((service, index) => (
                    <li key={service.id || index}>{service.name || service}</li>
                    ))}
                </ul>
                ) : (
                <Typography variant="body2">No hay servicios asociados.</Typography>
            )}
          </Grid>

          {event.image && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="textSecondary">Imagen</Typography>
              <Box component="img" src={event.image} alt="Imagen del evento" sx={{ mt: 1, maxWidth: '100%', height: 'auto', borderRadius: 2 }} />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button component={Link} to="/events" color="primary">
                Volver a la lista
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el evento "{event.name}"? 
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetail;

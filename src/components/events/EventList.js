import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Chip
} from '@mui/material';
import api from '../../services/api';

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleString('es-BO', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('events/');
      
      const data = response.data;
      // Si viene un objeto, conviértelo a array
      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data.results) {
        // Si tu backend está devolviendo paginación tipo { results: [...], count: X }
        setEvents(data.results);
      } else {
        setEvents([]);
      }
  
      setError(null);
    } catch (err) {
      setError('Error al cargar los eventos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadEvents();
  }, []);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`events/${eventToDelete.id}/`);
      setEvents(events.filter(ev => ev.id !== eventToDelete.id));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (err) {
      setError('Error al eliminar el evento: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  // Función para renderizar servicios o paquete según corresponda
  const renderServicesOrPackage = (event) => {
    if (event.is_package) {
      // Si es un paquete, mostramos el nombre del paquete
      return (
        <Box>
          <Chip 
            label="Paquete" 
            size="small" 
            color="primary" 
            sx={{ mr: 1, mb: 1 }} 
          />
          <Typography variant="body2">
            {event.package ? event.package.name : 'Sin paquete asignado'}
          </Typography>
        </Box>
      );
    } else {
      // Si son servicios individuales
      return (
        <Box>
          <Chip 
            label="Servicios individuales" 
            size="small" 
            color="secondary" 
            sx={{ mr: 1, mb: 1 }} 
          />
          <Typography variant="body2">
            {Array.isArray(event.services) && event.services.length > 0
              ? event.services.map((service) => service.name).join(', ')
              : 'Sin servicios asignados'}
          </Typography>
        </Box>
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Eventos</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/events/new"
        >
          Nuevo Evento
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {events.length === 0 ? (
        <Typography>No hay eventos disponibles.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Locación</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Servicios / Paquete</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{event.location ? event.location.name : 'Sin locación'}</TableCell>
                  <TableCell>{formatearFecha(event.start_date)}</TableCell>
                  <TableCell>{formatearFecha(event.end_date)}</TableCell>
                  <TableCell>{event.status}</TableCell>
                  
                  {/* Celda de servicios o paquete */}
                  <TableCell>
                    {renderServicesOrPackage(event)}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <Button 
                      component={Link} 
                      to={`/events/${event.id}`} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    >
                      Ver
                    </Button>
                    <Button 
                      component={Link} 
                      to={`/events/${event.id}/edit`} 
                      color="secondary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button 
                      onClick={() => handleDeleteClick(event)} 
                      color="error" 
                      size="small"
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el evento "{eventToDelete?.name}"?
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

export default EventList;
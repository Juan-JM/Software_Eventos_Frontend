import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, CircularProgress, 
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from '@mui/material';
import api from '../../services/api';

const LocationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const response = await api.get(`locations/${id}/`);
        setLocation(response.data);
      } catch (err) {
        setError('Error al cargar la locación: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`locations/${id}/`);
      navigate('/locations');
    } catch (err) {
      setError('Error al eliminar la locación: ' + err.message);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const renderLocationType = (type) => {
    const types = {
      'salon': 'Salón',
      'jardin': 'Jardín',
      'playa': 'Playa',
      'auditorio': 'Auditorio',
      'terraza': 'Terraza',
      'otro': 'Otro'
    };
    return types[type] || type;
  };

  const renderPriceUnit = (unit) => {
    const units = {
      'event': 'Por Evento',
      'hour': 'Por Hora',
      'day': 'Por Día'
    };
    return units[unit] || unit;
  };

  const renderEnvironmentType = (type) => {
    const types = {
      'cerrado': 'Cerrado',
      'abierto': 'Abierto',
      'semiabierto': 'Semiabierto'
    };
    return types[type] || type;
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
        <Button component={Link} to="/locations" sx={{ mt: 2 }}>
          Volver a la lista de locaciones
        </Button>
      </Box>
    );
  }

  if (!location) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Locación no encontrada</Typography>
        <Button component={Link} to="/locations" sx={{ mt: 2 }}>
          Volver a la lista de locaciones
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Detalle de la Locación</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link} 
            to={`/locations/${id}/edit`}
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
            <Typography variant="h5">{location.name}</Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Tipo de locación</Typography>
            <Typography variant="body1">{renderLocationType(location.location_type)}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Tipo de ambiente</Typography>
            <Typography variant="body1">{renderEnvironmentType(location.environment_type)}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Dirección</Typography>
            <Typography variant="body1">{location.address}</Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="textSecondary">Capacidad</Typography>
            <Typography variant="body1">{location.capacity} personas</Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="textSecondary">Área</Typography>
            <Typography variant="body1">{location.area_sqm} m²</Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="textSecondary">Estacionamiento</Typography>
            <Typography variant="body1">{location.parking_spaces} vehículos</Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="textSecondary">Precio de alquiler</Typography>
            <Typography variant="body1">${location.rental_price} {renderPriceUnit(location.price_unit)}</Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="textSecondary">Costo por hora extra</Typography>
            <Typography variant="body1">${location.extra_hour_cost}</Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="textSecondary">Proveedor asociado</Typography>
            <Typography variant="body1">{location.provider || 'Propio'}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Descripción</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{location.description}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button component={Link} to="/locations" color="primary">
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
            ¿Estás seguro de que deseas eliminar la locación "{location.name}"? 
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

export default LocationDetail;
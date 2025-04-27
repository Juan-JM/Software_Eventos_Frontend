import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, CircularProgress, 
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from '@mui/material';
import { getServiceById, deleteService } from '../../services/service.service';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      try {
        const response = await getServiceById(id);
        setService(response.data);
      } catch (err) {
        setError('Error al cargar el servicio: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteService(id);
      navigate('/services');
    } catch (err) {
      setError('Error al eliminar el servicio: ' + err.message);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const renderUnitMeasure = (unit) => {
    const units = {
      'event': 'Por Evento',
      'hour': 'Por Hora',
      'person': 'Por Persona',
      'day': 'Por Día',
      'unit': 'Por Unidad'
    };
    return units[unit] || unit;
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
        <Button component={Link} to="/services" sx={{ mt: 2 }}>
          Volver a la lista de servicios
        </Button>
      </Box>
    );
  }

  if (!service) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Servicio no encontrado</Typography>
        <Button component={Link} to="/services" sx={{ mt: 2 }}>
          Volver a la lista de servicios
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Detalle del Servicio</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link} 
            to={`/services/${id}/edit`}
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
            <Typography variant="h5">{service.name}</Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Proveedor</Typography>
            <Typography variant="body1">{service.provider}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Precio Base</Typography>
            <Typography variant="body1">${service.base_price}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Unidad de Medida</Typography>
            <Typography variant="body1">{renderUnitMeasure(service.unit_measure)}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Duración Estándar</Typography>
            <Typography variant="body1">
              {service.standard_duration ? `${service.standard_duration} minutos` : 'No aplicable'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Descripción</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{service.description}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button component={Link} to="/services" color="primary">
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
            ¿Estás seguro de que deseas eliminar el servicio "{service.name}"? 
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

export default ServiceDetail;
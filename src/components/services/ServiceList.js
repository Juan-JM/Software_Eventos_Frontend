import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllServices, deleteService } from '../../services/service.service';
// import { useAuth } from '../../contexts/AuthContext';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  // const { currentUser } = useAuth();

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await getAllServices();
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los servicios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteService(serviceToDelete.id);
      setServices(services.filter(s => s.id !== serviceToDelete.id));
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      setError('Error al eliminar el servicio: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Servicios</Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/services/new"
        >
          Nuevo Servicio
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {services.length === 0 ? (
        <Typography>No hay servicios disponibles.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Precio Base</TableCell>
                <TableCell>Unidad de Medida</TableCell>
                <TableCell>Duración Estándar</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>${service.base_price}</TableCell>
                  <TableCell>{renderUnitMeasure(service.unit_measure)}</TableCell>
                  <TableCell>
                    {service.standard_duration ? `${service.standard_duration} minutos` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {service.provider_detail ? service.provider_detail.commercial_name : 'Sin proveedor'}
                  </TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/services/${service.id}`}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(service)}
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
            ¿Estás seguro de que deseas eliminar el servicio "{serviceToDelete?.name}"?
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

export default ServiceList;
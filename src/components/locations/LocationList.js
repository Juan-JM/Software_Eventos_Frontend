import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import api from '../../services/api';

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('locations/');
      setLocations(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las locaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleDeleteClick = (location) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`locations/${locationToDelete.id}/`);
      setLocations(locations.filter(loc => loc.id !== locationToDelete.id));
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
    } catch (err) {
      setError('Error al eliminar la locación: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLocationToDelete(null);
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
        <Typography variant="h4">Locaciones</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/locations/new"
        >
          Nueva Locación
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {locations.length === 0 ? (
        <Typography>No hay locaciones disponibles.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Capacidad</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Área (m²)</TableCell>
                <TableCell>Ambiente</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>{renderLocationType(location.location_type)}</TableCell>
                  <TableCell>{location.capacity} personas</TableCell>
                  <TableCell>${location.rental_price} {renderPriceUnit(location.price_unit)}</TableCell>
                  <TableCell>{location.area_sqm}</TableCell>
                  <TableCell>{location.environment_type}</TableCell>
                  <TableCell>
                    <Button 
                      component={Link} 
                      to={`/locations/${location.id}`} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    >
                      Ver
                    </Button>
                    <Button 
                      component={Link} 
                      to={`/locations/${location.id}/edit`} 
                      color="secondary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button 
                      onClick={() => handleDeleteClick(location)} 
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
            ¿Estás seguro de que deseas eliminar la locación "{locationToDelete?.name}"? 
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

export default LocationList;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, CircularProgress,
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import api from '../../services/api';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadPackage = async () => {
      try {
        const response = await api.get(`packages/${id}/`);
        setPackage(response.data);
      } catch (err) {
        setError('Error al cargar el paquete: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPackage();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`packages/${id}/`);
      navigate('/packages');
    } catch (err) {
      setError('Error al eliminar el paquete: ' + err.message);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
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
        <Button component={Link} to="/packages" sx={{ mt: 2 }}>
          Volver a la lista de paquetes
        </Button>
      </Box>
    );
  }

  if (!pkg) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Paquete no encontrado</Typography>
        <Button component={Link} to="/packages" sx={{ mt: 2 }}>
          Volver a la lista de Paquetes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Detalle del Paquete</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to={`/packages/${id}/edit`}
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
            <Typography variant="h5">{pkg.name}</Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Descripción</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{pkg.description}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Servicios asociados</Typography>
            {Array.isArray(pkg.services) && pkg.services.length > 0 ? (
              <ul>
                {pkg.services.map((service, index) => (
                  <li key={service.id || index}>{service.name || service}</li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2">No hay servicios asociados.</Typography>
            )}
          </Grid>

          {pkg.image && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="textSecondary">Imagen</Typography>
              <Box component="img" src={pkg.image} alt="Imagen del Paquete" sx={{ mt: 1, maxWidth: '100%', height: 'auto', borderRadius: 2 }} />
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button component={Link} to="/packages" color="primary">
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
            ¿Estás seguro de que deseas eliminar el Paquete "{pkg.name}"?
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

export default PackageDetail;

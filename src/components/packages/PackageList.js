import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import api from '../../services/api';

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get('packages/');

      const data = response.data;
      // Si viene un objeto, conviértelo a array
      if (Array.isArray(data)) {
        setPackages(data);
      } else if (data.results) {
        // Si tu backend está devolviendo paginación tipo { results: [...], count: X }
        setPackages(data.results);
      } else {
        setPackages([]);
      }

      setError(null);
    } catch (err) {
      setError('Error al cargar los paquetes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadPackages();
  }, []);

  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`packages/${packageToDelete.id}/`);
      setPackages(packages.filter(ev => ev.id !== packageToDelete.id));
      setDeleteDialogOpen(false);
      setPackageToDelete(null);
    } catch (err) {
      setError('Error al eliminar el paquete: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPackageToDelete(null);
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
        <Typography variant="h4">Paquetes</Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/packages/new"
        >
          Nuevo Paquete
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {packages.length === 0 ? (
        <Typography>No hay paquetes disponibles.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Servicios</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.name}</TableCell>
                  <TableCell>
                    {Array.isArray(pkg.services) && pkg.services.length > 0 ? (
                      pkg.services.map((service) => service.name).join(', ')
                    ) : (
                      'Sin servicios'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/packages/${pkg.id}`}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Ver
                    </Button>
                    <Button
                      component={Link}
                      to={`/packages/${pkg.id}/edit`}
                      color="secondary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(pkg)}
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
            ¿Estás seguro de que deseas eliminar el paquete "{packageToDelete?.name}"?
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

export default PackageList;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProviders, deleteProvider } from '../../services/providers.service';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, InputAdornment, Chip, Avatar
} from '@mui/material';
import { Search, Business, Email, Phone, Language } from '@mui/icons-material';

const ProviderList = () => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await getAllProviders();
      setProviders(response.data);
      setFilteredProviders(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los proveedores: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    const filtered = providers.filter(provider =>
      provider.commercial_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProviders(filtered);
  }, [searchTerm, providers]);

  const handleDeleteClick = (provider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProvider(providerToDelete.id);
      setProviders(providers.filter(p => p.id !== providerToDelete.id));
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    } catch (err) {
      setError('Error al eliminar el proveedor: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProviderToDelete(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isAdmin = currentUser?.user_type === 'admin';
  const canEdit = isAdmin || currentUser?.user_type === 'staff';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestión de Proveedores</Typography>
        {canEdit && (
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/providers/new"
          >
            Nuevo Proveedor
          </Button>
        )}
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre comercial, contacto o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredProviders.length === 0 ? (
        <Typography>
          {searchTerm ? 'No se encontraron resultados' : 'No hay proveedores registrados'}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proveedor</TableCell>
                <TableCell>Contacto Principal</TableCell>
                <TableCell>Información de Contacto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha de Registro</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {provider.commercial_name}
                        </Typography>
                        {provider.website && (
                          <Typography variant="body2" color="textSecondary">
                            <Language sx={{ fontSize: 14, mr: 0.5 }} />
                            <a 
                              href={provider.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              Sitio Web
                            </a>
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {provider.contact_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Email sx={{ fontSize: 14, mr: 0.5 }} />
                        <a href={`mailto:${provider.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {provider.email}
                        </a>
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ fontSize: 14, mr: 0.5 }} />
                        <a href={`tel:${provider.contact_phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {provider.contact_phone}
                        </a>
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={provider.is_active ? 'Activo' : 'Inactivo'}
                      color={provider.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(provider.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      component={Link} 
                      to={`/providers/${provider.id}`} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    >
                      Ver
                    </Button>
                    {canEdit && (
                      <>
                        <Button 
                          component={Link} 
                          to={`/providers/${provider.id}/edit`} 
                          color="secondary" 
                          size="small" 
                          sx={{ mr: 1 }}
                        >
                          Editar
                        </Button>
                        {isAdmin && (
                          <Button 
                            onClick={() => handleDeleteClick(provider)} 
                            color="error" 
                            size="small"
                          >
                            Eliminar
                          </Button>
                        )}
                      </>
                    )}
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
            ¿Estás seguro de que deseas eliminar al proveedor "{providerToDelete?.commercial_name}"? 
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

export default ProviderList;
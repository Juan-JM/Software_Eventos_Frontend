import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProviderById, deleteProvider } from '../../services/providers.service';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, Typography, Paper, Grid, Button, CircularProgress, 
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Chip, Card, CardContent, Avatar
} from '@mui/material';
import { 
  Business, Email, Phone, Language, LocationOn, 
  Person, Notes, CalendarToday
} from '@mui/icons-material';

const ProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchProvider();
  }, [id]);

  const fetchProvider = async () => {
    try {
      setLoading(true);
      const response = await getProviderById(id);
      setProvider(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos del proveedor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProvider(id);
      navigate('/providers');
    } catch (err) {
      setError('Error al eliminar el proveedor: ' + err.message);
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
        <Button component={Link} to="/providers" sx={{ mt: 2 }}>
          Volver a la lista de proveedores
        </Button>
      </Box>
    );
  }

  if (!provider) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Proveedor no encontrado</Typography>
        <Button component={Link} to="/providers" sx={{ mt: 2 }}>
          Volver a la lista de proveedores
        </Button>
      </Box>
    );
  }

  const isAdmin = currentUser?.user_type === 'admin';
  const canEdit = isAdmin || currentUser?.user_type === 'staff';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Detalle del Proveedor</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link} 
            to="/providers"
            sx={{ mr: 1 }}
          >
            Volver
          </Button>
          {canEdit && (
            <>
              <Button 
                variant="outlined" 
                color="secondary" 
                component={Link} 
                to={`/providers/${id}/edit`}
                sx={{ mr: 1 }}
              >
                Editar
              </Button>
              {isAdmin && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleDeleteClick}
                >
                  Eliminar
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Información principal del proveedor */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
              >
                <Business sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {provider.commercial_name}
              </Typography>
              <Chip 
                label={provider.is_active ? 'Activo' : 'Inactivo'}
                color={provider.is_active ? 'success' : 'error'}
                sx={{ mb: 2 }}
              />
              <Typography variant="body1" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                <Person sx={{ mr: 1 }} />
                {provider.contact_name}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Información detallada */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* Información de Contacto */}
            <Typography variant="h6" gutterBottom>
              Información de Contacto
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Correo electrónico
                  </Typography>
                </Box>
                <Typography variant="body1">
                  <a href={`mailto:${provider.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {provider.email}
                  </a>
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Teléfono
                  </Typography>
                </Box>
                <Typography variant="body1">
                  <a href={`tel:${provider.contact_phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {provider.contact_phone}
                  </a>
                </Typography>
              </Grid>

              {provider.website && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Language sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" color="textSecondary">
                      Sitio web
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    <a 
                      href={provider.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: 'primary.main' }}
                    >
                      {provider.website}
                    </a>
                  </Typography>
                </Grid>
              )}

              {provider.address && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                    <Typography variant="subtitle2" color="textSecondary">
                      Dirección
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 3 }}>
                    {provider.address}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Notas */}
            {provider.notes && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Notas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Notes sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {provider.notes}
                  </Typography>
                </Box>
              </>
            )}

            {/* Información del Sistema */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Información del Sistema
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Fecha de registro
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {new Date(provider.created_at).toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Última actualización
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(provider.updated_at).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar al proveedor "{provider.commercial_name}"? 
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

export default ProviderDetail;
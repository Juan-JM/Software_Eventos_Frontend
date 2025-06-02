import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStaffById, deleteStaff } from '../../services/staff.service';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, Typography, Paper, Grid, Button, CircularProgress, 
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Avatar, Chip, Card, CardContent
} from '@mui/material';
import { Email, Phone, LocationOn, Work, CalendarToday, Badge } from '@mui/icons-material';

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [id]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await getStaffById(id);
      setStaff(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos del personal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStaff(id);
      navigate('/staff');
    } catch (err) {
      setError('Error al eliminar el personal: ' + err.message);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const renderPosition = (position) => {
    const positions = {
      'tecnico': 'Técnico',
      'logistica': 'Logística',
      'seguridad': 'Seguridad',
      'coordinador': 'Coordinador',
      'catering': 'Catering',
      'audiovisual': 'Audiovisual',
      'limpieza': 'Limpieza',
      'decoracion': 'Decoración',
      'otro': 'Otro'
    };
    return positions[position] || position;
  };

  const getPositionColor = (position) => {
    const colors = {
      'tecnico': 'primary',
      'logistica': 'secondary',
      'seguridad': 'error',
      'coordinador': 'success',
      'catering': 'warning',
      'audiovisual': 'info',
      'limpieza': 'default',
      'decoracion': 'secondary',
      'otro': 'default'
    };
    return colors[position] || 'default';
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
        <Button component={Link} to="/staff" sx={{ mt: 2 }}>
          Volver a la lista de personal
        </Button>
      </Box>
    );
  }

  if (!staff) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Personal no encontrado</Typography>
        <Button component={Link} to="/staff" sx={{ mt: 2 }}>
          Volver a la lista de personal
        </Button>
      </Box>
    );
  }

  const isAdmin = currentUser?.user_type === 'admin';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Detalle del Personal</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link} 
            to="/staff"
            sx={{ mr: 1 }}
          >
            Volver
          </Button>
          {isAdmin && (
            <>
              <Button 
                variant="outlined" 
                color="secondary" 
                component={Link} 
                to={`/staff/${id}/edit`}
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
            </>
          )}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Información principal del personal */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={staff.photo}
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
              >
                {staff.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {staff.full_name}
              </Typography>
              <Chip 
                label={renderPosition(staff.position)} 
                color={getPositionColor(staff.position)}
                sx={{ mb: 2 }}
              />
              <br />
              <Chip 
                label={staff.is_active ? 'Activo' : 'Inactivo'}
                color={staff.is_active ? 'success' : 'error'}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                {staff.age} años
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Información detallada */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* Información Personal */}
            <Typography variant="h6" gutterBottom>
              Información Personal
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Teléfono
                  </Typography>
                </Box>
                <Typography variant="body1">
                  <a href={`tel:${staff.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {staff.phone}
                  </a>
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Dirección
                  </Typography>
                </Box>
                <Typography variant="body1">{staff.address}</Typography>
              </Grid>
            </Grid>

            {/* Información Laboral */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Información Laboral
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Work sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Puesto o rol
                  </Typography>
                </Box>
                <Chip 
                  label={renderPosition(staff.position)} 
                  color={getPositionColor(staff.position)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Fecha de ingreso
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {new Date(staff.hire_date).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>

            {/* Información del Sistema */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Información del Sistema
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Fecha de creación
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(staff.created_at).toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Última actualización
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(staff.updated_at).toLocaleString()}
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
            ¿Estás seguro de que deseas eliminar a "{staff.full_name}"? 
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

export default StaffDetail
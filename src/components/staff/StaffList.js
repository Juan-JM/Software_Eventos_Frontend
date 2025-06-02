import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllStaff, deleteStaff } from '../../services/staff.service';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, InputAdornment, Chip, Avatar
} from '@mui/material';
import { Search } from '@mui/icons-material';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await getAllStaff();
      setStaff(response.data);
      setFilteredStaff(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el personal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    const filtered = staff.filter(person =>
      person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.identity_document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [searchTerm, staff]);

  const handleDeleteClick = (person) => {
    setStaffToDelete(person);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStaff(staffToDelete.id);
      setStaff(staff.filter(s => s.id !== staffToDelete.id));
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    } catch (err) {
      setError('Error al eliminar el personal: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestión de Personal</Typography>
        {currentUser?.user_type === 'admin' && (
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/staff/new"
          >
            Nuevo Personal
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
          placeholder="Buscar por nombre, documento o email..."
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

      {filteredStaff.length === 0 ? (
        <Typography>
          {searchTerm ? 'No se encontraron resultados' : 'No hay personal registrado'}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Personal</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Puesto</TableCell>
                <TableCell>Fecha Ingreso</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={person.photo}
                        alt={person.full_name}
                        sx={{ mr: 2, width: 40, height: 40 }}
                      >
                        {person.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {person.full_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {person.age} años
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{person.identity_document}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{person.email}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {person.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={renderPosition(person.position)} 
                      color={getPositionColor(person.position)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(person.hire_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={person.is_active ? 'Activo' : 'Inactivo'}
                      color={person.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      component={Link} 
                      to={`/staff/${person.id}`} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    >
                      Ver
                    </Button>
                    {currentUser?.user_type === 'admin' && (
                      <>
                        <Button 
                          component={Link} 
                          to={`/staff/${person.id}/edit`} 
                          color="secondary" 
                          size="small" 
                          sx={{ mr: 1 }}
                        >
                          Editar
                        </Button>
                        <Button 
                          onClick={() => handleDeleteClick(person)} 
                          color="error" 
                          size="small"
                        >
                          Eliminar
                        </Button>
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
            ¿Estás seguro de que deseas eliminar a "{staffToDelete?.full_name}"? 
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

export default StaffList;
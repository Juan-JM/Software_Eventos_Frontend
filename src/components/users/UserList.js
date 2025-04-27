// frontend/src/components/users/UserList.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getAllUsers, deleteUser } from '../../services/user.service';
import { 
  Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Alert, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los usuarios');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteClick = (userId) => {
    setDeleteDialog({ open: true, userId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteDialog.userId);
      setUsers(users.filter(user => user.id !== deleteDialog.userId));
      setFeedback({ message: 'Usuario eliminado con éxito', type: 'success' });
    } catch (err) {
      setFeedback({ message: 'Error al eliminar el usuario', type: 'error' });
    } finally {
      setDeleteDialog({ open: false, userId: null });
      // Ocultar el feedback después de 3 segundos
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };

  if (loading) return <Typography>Cargando usuarios...</Typography>;
  
  if (error) return <Alert severity="error">{error}</Alert>;
  // frontend/src/components/users/UserList.js (continuación)
  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 4 }}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/users/new"
        >
          Nuevo Usuario
        </Button>
      </Box>

      {feedback.message && (
        <Alert severity={feedback.type} sx={{ mb: 2 }}>
          {feedback.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.user_type}</TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" 
                    component={RouterLink} 
                    to={`/users/${user.id}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClick(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, userId: null })}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, userId: null })}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserList;
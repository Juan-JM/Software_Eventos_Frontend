//src/components/tasks/TaskList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTasks, deleteTask, updateTaskStatus } from '../../services/tasks.service';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Chip, Menu
} from '@mui/material';
import { Search, MoreVert } from '@mui/icons-material';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const statusChoices = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'en_progreso':
        return 'info';
      case 'completada':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return labels[status] || status;
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await getAllTasks();
      setTasks(response.data);
      setFilteredTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    let filtered = tasks;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por estado
    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    setFilteredTasks(filtered);
  }, [searchTerm, statusFilter, tasks]);

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(taskToDelete.id);
      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      setError('Error al eliminar la tarea: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      setMenuAnchor(null);
    } catch (err) {
      setError('Error al actualizar el estado: ' + err.message);
    }
  };

  const handleMenuClick = (event, task) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTask(null);
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
        <Typography variant="h4">Gestión de Tareas</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/tasks/new"
        >
          Nueva Tarea
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Filtros */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar por título o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Estado"
          >
            {statusChoices.map(choice => (
              <MenuItem key={choice.value} value={choice.value}>
                {choice.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredTasks.length === 0 ? (
        <Typography>
          {searchTerm || statusFilter ? 'No se encontraron resultados' : 'No hay tareas registradas'}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tarea</TableCell>
                <TableCell>Evento</TableCell>
                <TableCell>Responsable</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {task.title}
                      </Typography>
                      {task.description && (
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {task.description.length > 50 
                            ? `${task.description.substring(0, 50)}...` 
                            : task.description
                          }
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{task.event_name}</TableCell>
                  <TableCell>{task.assigned_staff_names || 'Sin asignar'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={getStatusLabel(task.status)}
                        color={getStatusColor(task.status)}
                        size="small"
                      />
                      <Button
                        size="small"
                        onClick={(e) => handleMenuClick(e, task)}
                      >
                        <MoreVert fontSize="small" />
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(task.start_datetime).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(task.start_datetime).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(task.end_datetime).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(task.end_datetime).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button 
                      component={Link} 
                      to={`/tasks/${task.id}`} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    >
                      Ver
                    </Button>
                    <Button 
                      component={Link} 
                      to={`/tasks/${task.id}/edit`} 
                      color="secondary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button 
                      onClick={() => handleDeleteClick(task)} 
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

      {/* Menú para cambiar estado */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {statusChoices.slice(1).map(choice => (
          <MenuItem 
            key={choice.value}
            onClick={() => handleStatusChange(selectedTask?.id, choice.value)}
            disabled={selectedTask?.status === choice.value}
          >
            <Chip 
              label={choice.label}
              color={getStatusColor(choice.value)}
              size="small"
              sx={{ mr: 1 }}
            />
            Cambiar a {choice.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar la tarea "{taskToDelete?.title}"? 
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

export default TaskList;
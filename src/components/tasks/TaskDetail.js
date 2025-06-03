import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTaskById, deleteTask, updateTaskStatus } from '../../services/tasks.service';
import { 
  Box, Typography, Paper, Grid, Button, CircularProgress, 
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Chip, Card, CardContent, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Event, Person, Schedule, Assignment, Notes, 
  CalendarToday, AccessTime
} from '@mui/icons-material';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const statusChoices = [
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

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await getTaskById(id);
      setTask(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos de la tarea: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      setError('Error al eliminar la tarea: ' + err.message);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTaskStatus(id, newStatus);
      setTask(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError('Error al actualizar el estado: ' + err.message);
    }
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
        <Button component={Link} to="/tasks" sx={{ mt: 2 }}>
          Volver a la lista de tareas
        </Button>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Tarea no encontrada</Typography>
        <Button component={Link} to="/tasks" sx={{ mt: 2 }}>
          Volver a la lista de tareas
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Detalle de la Tarea</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link} 
            to="/tasks"
            sx={{ mr: 1 }}
          >
            Volver
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            component={Link} 
            to={`/tasks/${id}/edit`}
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
      
      <Grid container spacing={3}>
        {/* Información principal de la tarea */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {task.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={getStatusLabel(task.status)}
                color={getStatusColor(task.status)}
                sx={{ mr: 2 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Cambiar estado</InputLabel>
                <Select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  label="Cambiar estado"
                >
                  {statusChoices.map(choice => (
                    <MenuItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Descripción */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6">Descripción</Typography>
              </Box>
              <Typography variant="body1" sx={{ pl: 4 }}>
                {task.description}
              </Typography>
            </Box>

            {/* Programación */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6">Programación</Typography>
              </Box>
              <Grid container spacing={2} sx={{ pl: 4 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="subtitle2" color="textSecondary">
                      Fecha y hora de inicio
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {new Date(task.start_datetime).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="subtitle2" color="textSecondary">
                      Fecha y hora de finalización
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {new Date(task.end_datetime).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Evento relacionado */}
            {task.event_name && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Event sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6">Evento Relacionado</Typography>
                </Box>
                <Typography variant="body1" sx={{ pl: 4 }}>
                  {task.event_name}
                </Typography>
              </Box>
            )}

            {/* Notas adicionales */}
            {task.notes && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Notes sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6">Notas e Instrucciones</Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, ml: 4, backgroundColor: 'grey.50' }}>
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                    {task.notes}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Información del sistema */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Información del Sistema
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Fecha de creación
                </Typography>
                <Typography variant="body2">
                  {new Date(task.created_at).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Última actualización
                </Typography>
                <Typography variant="body2">
                  {new Date(task.updated_at).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Panel lateral - Personal asignado */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6">Personal Asignado</Typography>
              </Box>
              
              {task.assigned_staff_details && task.assigned_staff_details.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {task.assigned_staff_details.map(person => (
                    <Paper key={person.id} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {person.full_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {person.position_display}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {person.email}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {person.phone}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No hay personal asignado a esta tarea
                </Typography>
              )}
            </CardContent>
          </Card>
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
            ¿Estás seguro de que deseas eliminar la tarea "{task.title}"? 
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

export default TaskDetail;
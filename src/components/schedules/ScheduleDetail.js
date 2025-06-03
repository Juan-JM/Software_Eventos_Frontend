import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getScheduleById, deleteSchedule, addActivityToSchedule, 
  updateActivityStatus, deleteActivity 
} from '../../services/schedules.service';
import { 
  Box, Typography, Paper, Grid, Button, CircularProgress, 
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Card, CardContent, Chip, LinearProgress, IconButton, Menu, MenuItem,
  TextField, FormControl, InputLabel, Select, Alert
} from '@mui/material';
import { 
  Event, Schedule as ScheduleIcon, AccessTime, Add, MoreVert,
  PlayArrow, Pause, CheckCircle, Cancel, Assignment
} from '@mui/icons-material';

const ScheduleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityFormData, setActivityFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    status: 'planificada'
  });

  const statusChoices = [
    { value: 'planificada', label: 'Planificada', color: 'default', icon: Assignment },
    { value: 'en_progreso', label: 'En Progreso', color: 'info', icon: PlayArrow },
    { value: 'completada', label: 'Completada', color: 'success', icon: CheckCircle },
    { value: 'cancelada', label: 'Cancelada', color: 'error', icon: Cancel }
  ];

  useEffect(() => {
    fetchSchedule();
  }, [id]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await getScheduleById(id);
      setSchedule(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos del cronograma: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSchedule(id);
      navigate('/schedules');
    } catch (err) {
      setError('Error al eliminar el cronograma: ' + err.message);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleActivityFormChange = (e) => {
    const { name, value } = e.target;
    setActivityFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddActivity = async () => {
    try {
      // Validar que start_time sea menor que end_time
      if (activityFormData.start_time >= activityFormData.end_time) {
        setError('La hora de inicio debe ser anterior a la hora de finalización');
        return;
      }

      await addActivityToSchedule(id, activityFormData);
      
      // Recargar el cronograma para ver la nueva actividad
      await fetchSchedule();
      
      // Resetear el formulario y cerrar el diálogo
      setActivityFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        status: 'planificada'
      });
      setActivityDialogOpen(false);
      setError(null);
    } catch (err) {
      setError('Error al agregar la actividad: ' + err.message);
    }
  };

  const handleMenuClick = (event, activity) => {
    setMenuAnchor(event.currentTarget);
    setSelectedActivity(activity);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedActivity(null);
  };

  const handleStatusChange = async (activityId, newStatus) => {
    try {
      await updateActivityStatus(activityId, newStatus);
      await fetchSchedule(); // Recargar para actualizar los datos
      setMenuAnchor(null);
    } catch (err) {
      setError('Error al actualizar el estado: ' + err.message);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteActivity(activityId);
      await fetchSchedule(); // Recargar para actualizar los datos
      setMenuAnchor(null);
    } catch (err) {
      setError('Error al eliminar la actividad: ' + err.message);
    }
  };

  const getStatusInfo = (status) => {
    return statusChoices.find(choice => choice.value === status) || statusChoices[0];
  };

  const getProgressPercentage = () => {
    if (!schedule || schedule.total_activities === 0) return 0;
    return Math.round((schedule.completed_activities / schedule.total_activities) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'success';
    if (percentage >= 50) return 'info';
    if (percentage > 0) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !schedule) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button component={Link} to="/schedules" sx={{ mt: 2 }}>
          Volver a la lista de cronogramas
        </Button>
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cronograma no encontrado</Typography>
        <Button component={Link} to="/schedules" sx={{ mt: 2 }}>
          Volver a la lista de cronogramas
        </Button>
      </Box>
    );
  }

  const progressPercentage = getProgressPercentage();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Cronograma del Evento</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link} 
            to="/schedules"
            sx={{ mr: 1 }}
          >
            Volver
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            component={Link} 
            to={`/schedules/${id}/edit`}
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Información del cronograma */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Event sx={{ mr: 1, verticalAlign: 'middle' }} />
                Información del Evento
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {schedule.event.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(schedule.event.start_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {schedule.event.location_name || 'Sin ubicación'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Horario del Cronograma
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body1">
                  {schedule.start_time} - {schedule.end_time}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Progreso de Actividades
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {schedule.completed_activities} de {schedule.total_activities} completadas
                  </Typography>
                  <Typography variant="body2">
                    {progressPercentage}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage}
                  color={getProgressColor(progressPercentage)}
                />
              </Box>

              <Typography variant="body2" color="textSecondary">
                Creado: {new Date(schedule.created_at).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de actividades */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                Actividades del Cronograma ({schedule.activities.length})
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Add />}
                onClick={() => setActivityDialogOpen(true)}
              >
                Agregar Actividad
              </Button>
            </Box>

            {schedule.activities.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No hay actividades programadas
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Comienza agregando la primera actividad a este cronograma
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => setActivityDialogOpen(true)}
                >
                  Agregar Primera Actividad
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedule.activities.map((activity) => {
                  const statusInfo = getStatusInfo(activity.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <Card key={activity.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" sx={{ mr: 2 }}>
                                {activity.title}
                              </Typography>
                              <Chip 
                                icon={<StatusIcon />}
                                label={statusInfo.label}
                                color={statusInfo.color}
                                size="small"
                              />
                            </Box>
                            
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                              {activity.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                                <Typography variant="body2">
                                  {activity.start_time} - {activity.end_time}
                                </Typography>
                              </Box>
                              <Chip 
                                label={activity.duration_formatted}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          
                          <IconButton 
                            onClick={(e) => handleMenuClick(e, activity)}
                            size="small"
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Menú de acciones para actividades */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Cambiar estado a:</Typography>
        </MenuItem>
        {statusChoices.map(choice => {
          const StatusIcon = choice.icon;
          return (
            <MenuItem 
              key={choice.value}
              onClick={() => handleStatusChange(selectedActivity?.id, choice.value)}
              disabled={selectedActivity?.status === choice.value}
            >
              <StatusIcon sx={{ mr: 1, fontSize: 16 }} />
              {choice.label}
            </MenuItem>
          );
        })}
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteActivity(selectedActivity?.id)}
          sx={{ color: 'error.main' }}
        >
          <Cancel sx={{ mr: 1, fontSize: 16 }} />
          Eliminar actividad
        </MenuItem>
      </Menu>

      {/* Diálogo para agregar actividad */}
      <Dialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Nueva Actividad</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre o título de la actividad"
            name="title"
            value={activityFormData.title}
            onChange={handleActivityFormChange}
            fullWidth
            required
            margin="normal"
          />
          
          <TextField
            label="Descripción"
            name="description"
            value={activityFormData.description}
            onChange={handleActivityFormChange}
            fullWidth
            required
            multiline
            rows={3}
            margin="normal"
            helperText="Detalles sobre qué se realizará en esta actividad"
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Hora de inicio"
                name="start_time"
                value={activityFormData.start_time}
                onChange={handleActivityFormChange}
                fullWidth
                required
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Hora de finalización"
                name="end_time"
                value={activityFormData.end_time}
                onChange={handleActivityFormChange}
                fullWidth
                required
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Estado inicial</InputLabel>
            <Select
              name="status"
              value={activityFormData.status}
              onChange={handleActivityFormChange}
              label="Estado inicial"
            >
              {statusChoices.map(choice => {
                const StatusIcon = choice.icon;
                return (
                  <MenuItem key={choice.value} value={choice.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StatusIcon sx={{ mr: 1, fontSize: 16 }} />
                      {choice.label}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleAddActivity} 
            color="primary" 
            variant="contained"
            disabled={!activityFormData.title || !activityFormData.description || 
                     !activityFormData.start_time || !activityFormData.end_time}
          >
            Agregar Actividad
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar cronograma */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el cronograma de "{schedule.event.name}"? 
            Esta acción eliminará también todas las actividades asociadas ({schedule.activities.length}) 
            y no se puede deshacer.
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

export default ScheduleDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createSchedule, updateSchedule, getScheduleById } from '../../services/schedules.service';
import { getAllEvents } from '../../services/event.service';
import { 
  TextField, Button, Box, Typography, MenuItem, FormControl, 
  Select, InputLabel, CircularProgress, Grid, Paper, Divider,
  Alert, Chip
} from '@mui/material';
import { Event, Schedule as ScheduleIcon, AccessTime } from '@mui/icons-material';

const ScheduleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsWithoutSchedule, setEventsWithoutSchedule] = useState([]);
  const [formData, setFormData] = useState({
    event_id: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchInitialData();
    if (isEditMode) {
      fetchSchedule();
    }
  }, [id, isEditMode]);

  const fetchInitialData = async () => {
    try {
      const eventsResponse = await getAllEvents();
      setEvents(eventsResponse.data);
      
      // Filtrar eventos que no tienen cronograma (solo para crear)
      if (!isEditMode) {
        const eventsWithoutSchedule = eventsResponse.data.filter(event => !event.schedule);
        setEventsWithoutSchedule(eventsWithoutSchedule);
      }
    } catch (err) {
      console.error('Error al cargar eventos:', err);
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await getScheduleById(id);
      const scheduleData = response.data;
      
      setFormData({
        event_id: scheduleData.event.id,
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time
      });
    } catch (err) {
      setError('Error al cargar los datos del cronograma: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Validar que start_time sea menor que end_time
      if (formData.start_time >= formData.end_time) {
        setError('La hora de inicio debe ser anterior a la hora de finalización');
        return;
      }

      if (isEditMode) {
        await updateSchedule(id, formData);
      } else {
        await createSchedule(formData);
      }
      
      navigate('/schedules');
    } catch (err) {
      console.error('Error completo:', err);
      
      let errorMessage = 'Error al guardar el cronograma: ';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage += err.response.data;
        } else if (err.response.data.detail) {
          errorMessage += err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage += err.response.data.message;
        } else {
          // Si hay errores de campo específicos
          const fieldErrors = [];
          Object.keys(err.response.data).forEach(field => {
            if (Array.isArray(err.response.data[field])) {
              fieldErrors.push(`${field}: ${err.response.data[field].join(', ')}`);
            } else {
              fieldErrors.push(`${field}: ${err.response.data[field]}`);
            }
          });
          errorMessage += fieldErrors.join('. ');
        }
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedEvent = () => {
    return events.find(event => event.id === parseInt(formData.event_id));
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedEvent = getSelectedEvent();
  const availableEvents = isEditMode ? events : eventsWithoutSchedule;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEditMode ? 'Editar Cronograma' : 'Nuevo Cronograma'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isEditMode && eventsWithoutSchedule.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No hay eventos disponibles para crear cronogramas. Todos los eventos ya tienen cronogramas asignados 
          o no tienes eventos creados.
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Selección de evento */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información del Cronograma
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Evento</InputLabel>
                <Select
                  name="event_id"
                  value={formData.event_id}
                  onChange={handleInputChange}
                  label="Evento"
                  disabled={isEditMode} // No permitir cambiar evento en modo edición
                >
                  {availableEvents.map(event => (
                    <MenuItem key={event.id} value={event.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Event sx={{ mr: 1, color: 'primary.main' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">
                            {event.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(event.start_date).toLocaleDateString('es-ES')} - {event.location?.name}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {isEditMode && (
                <Typography variant="caption" color="textSecondary">
                  No puedes cambiar el evento de un cronograma existente
                </Typography>
              )}
            </Grid>

            {/* Información del evento seleccionado */}
            {selectedEvent && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <Event sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Información del Evento
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary">
                        Nombre
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary">
                        Fecha del evento
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedEvent.start_date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary">
                        Ubicación
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.location?.name || 'Sin ubicación'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Horario del cronograma */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                Horario del Cronograma
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Hora de inicio del cronograma"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                fullWidth
                required
                type="time"
                InputLabelProps={{ shrink: true }}
                margin="normal"
                helperText="Hora en que inicia el cronograma de actividades"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Hora de finalización del cronograma"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                fullWidth
                required
                type="time"
                InputLabelProps={{ shrink: true }}
                margin="normal"
                helperText="Hora en que termina el cronograma de actividades"
              />
            </Grid>

            {/* Información adicional */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Información importante:</strong>
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Una vez creado el cronograma, podrás agregar actividades individuales</li>
                  <li>Las actividades se ordenarán automáticamente por hora de inicio</li>
                  <li>Puedes tener múltiples actividades al mismo tiempo</li>
                  <li>Cada actividad puede tener su propio estado (planificada, en progreso, completada, cancelada)</li>
                </ul>
              </Alert>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/schedules')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading || (!isEditMode && eventsWithoutSchedule.length === 0)}
                  startIcon={loading ? <CircularProgress size={20} /> : <ScheduleIcon />}
                >
                  {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Cronograma'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ScheduleForm;
//src/components/tasks/TaskForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createTask, updateTask, getTaskById } from '../../services/tasks.service';
import { getAllEvents } from '../../services/event.service';
import { getActiveStaff } from '../../services/staff.service';
import { 
  TextField, Button, Box, Typography, MenuItem, FormControl, 
  Select, InputLabel, CircularProgress, Grid, Paper, Divider,
  Chip, OutlinedInput
} from '@mui/material';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    event: '',
    assigned_staff: [],
    status: 'pendiente',
    notes: ''
  });

  const statusChoices = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  useEffect(() => {
    fetchInitialData();
    if (isEditMode) {
      fetchTask();
    }
  }, [id, isEditMode]);

  const fetchInitialData = async () => {
    try {
      const [eventsResponse, staffResponse] = await Promise.all([
        getAllEvents(),
        getActiveStaff()
      ]);
      setEvents(eventsResponse.data);
      setStaff(staffResponse.data);
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
    }
  };

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await getTaskById(id);
      const taskData = response.data;
      
      // Formatear fechas para input datetime-local
      const formatDateTimeLocal = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: taskData.title,
        description: taskData.description,
        start_datetime: formatDateTimeLocal(taskData.start_datetime),
        end_datetime: formatDateTimeLocal(taskData.end_datetime),
        event: taskData.event || '',
        assigned_staff: taskData.assigned_staff || [],
        status: taskData.status,
        notes: taskData.notes || ''
      });
    } catch (err) {
      setError('Error al cargar los datos de la tarea: ' + err.message);
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

  const handleStaffChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      assigned_staff: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Validar fechas
      if (new Date(formData.start_datetime) >= new Date(formData.end_datetime)) {
        setError('La fecha de inicio debe ser anterior a la fecha de finalización');
        return;
      }

      const submitData = {
        ...formData,
        event: formData.event || null,
        assigned_staff: formData.assigned_staff.map(id => parseInt(id))
      };

      if (isEditMode) {
        await updateTask(id, submitData);
      } else {
        await createTask(submitData);
      }
      
      navigate('/tasks');
    } catch (err) {
      setError('Error al guardar la tarea: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Información básica */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Nombre o título de la tarea"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción detallada"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>

            {/* Programación */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Programación
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha y hora de inicio"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleInputChange}
                fullWidth
                required
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha y hora de finalización"
                name="end_datetime"
                value={formData.end_datetime}
                onChange={handleInputChange}
                fullWidth
                required
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>

            {/* Asignación */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Asignación
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Evento (opcional)</InputLabel>
                <Select
                  name="event"
                  value={formData.event}
                  onChange={handleInputChange}
                  label="Evento (opcional)"
                >
                  <MenuItem value="">Sin evento</MenuItem>
                  {events.map(event => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.name} - {new Date(event.start_date).toLocaleDateString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Estado de la tarea</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Estado de la tarea"
                  required
                >
                  {statusChoices.map(choice => (
                    <MenuItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Responsables (opcional)</InputLabel>
                <Select
                  multiple
                  name="assigned_staff"
                  value={formData.assigned_staff}
                  onChange={handleStaffChange}
                  input={<OutlinedInput label="Responsables (opcional)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const person = staff.find(s => s.id === parseInt(value));
                        return (
                          <Chip 
                            key={value} 
                            label={person ? person.full_name : value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {staff.map(person => (
                    <MenuItem key={person.id} value={person.id}>
                      {person.full_name} - {person.position_display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary">
                Selecciona uno o más responsables para esta tarea
              </Typography>
            </Grid>

            {/* Notas adicionales */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Información Adicional
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notas o instrucciones adicionales"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                helperText="Información adicional sobre la tarea"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/tasks')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : isEditMode ? 'Actualizar' : 'Crear'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskForm;
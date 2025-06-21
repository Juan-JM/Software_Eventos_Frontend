import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Box, Typography, MenuItem, FormControl, 
  Select, InputLabel, CircularProgress, Grid, Paper, Checkbox, 
  ListItemText, OutlinedInput 
} from '@mui/material';
import api from '../../services/api';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [customers, setCustomers] = useState([]);

  const [event, setEvent] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    services: [],
    status: 'scheduled',
    image: '',
    attendee_count: 0,
    owner: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      username: '',
      password: '',
      password2: ''
    }    
  });
  

  const isEditMode = Boolean(id);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
  
        const [locationsRes, servicesRes] = await Promise.all([
          api.get('locations/'),
          api.get('services/')

        ]);
        setLocations(locationsRes.data.results || locationsRes.data);
        setServices(servicesRes.data.results || servicesRes.data);
  
        if (isEditMode) {
          const eventRes = await api.get(`events/${id}/`);
          const data = eventRes.data;
        
          setEvent({
            name: data.name,
            description: data.description,
            start_date: data.start_date ? data.start_date.slice(0, 16) : '',
            end_date: data.end_date ? data.end_date.slice(0, 16) : '',
            location: data.location?.id || '',
            services: data.services ? data.services.map(service => service.id) : [],
            status: data.status,
            image: data.image || '',
            owner: data.owner || {}  // ← 🔥 Agregado para evitar error en campos del cliente
          });
        
          setPreviewImage(data.image || '');
        }
        
      } catch (err) {
        setError('Error cargando datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => ({
      ...prev,
      [name]: value
    }));
  
    if (name === 'image') {
      setPreviewImage(value); // Actualiza la previsualización
    }
  };
  

  const handleServicesChange = (e) => {
    const { value } = e.target;
    setEvent(prev => ({
      ...prev,
      services: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
  
      // Armo el payload básico
      const payload = {
        name: event.name,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        location_id: parseInt(event.location, 10),
        service_ids: event.services.map(id => parseInt(id, 10)),
        status: event.status,
        image: event.image,
        attendee_count: parseInt(event.attendee_count || 0, 10),
      };
      
  
      if (isEditMode) {
        await api.put(`events/${id}/`, payload);
      } else {
        await api.post('events/', payload);
      }
  
      navigate('/events');
    } catch (err) {
      let message = 'Error desconocido';
      const data = err.response?.data;
  
      if (typeof data === 'string') {
        message = data;
      } else if (data?.detail) {
        message = data.detail;
      } else if (Array.isArray(data)) {
        message = data.join(', ');
      } else if (typeof data === 'object') {
        const errores = [];
        for (const key in data) {
          if (Array.isArray(data[key])) {
            errores.push(`${key}: ${data[key].join(', ')}`);
          } else {
            errores.push(`${key}: ${data[key]}`);
          }
        }
        message = errores.join(' | ');
      }
  
      setError(`❌ ${message}`);
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
        {isEditMode ? 'Editar Evento' : 'Nuevo Evento'}
      </Typography>

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#ffe6e6', border: '1px solid #ff4d4f', borderRadius: '4px' }}>
          <Typography color="error" fontWeight="bold">
            {error}
          </Typography>
        </Box>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre del evento"
                name="name"
                value={event.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="description"
                value={event.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha de inicio"
                name="start_date"
                type="datetime-local"
                value={event.start_date}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha de fin"
                name="end_date"
                type="datetime-local"
                value={event.end_date}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
                       
            <Grid item xs={12} md={6}>
              <TextField
                label="Cantidad de asistentes"
                name="attendee_count"  // ← coincide con el modelo/serializer
                type="number"
                value={event.attendee_count}
                onChange={e => setEvent(prev => ({
                  ...prev,
                  attendee_count: e.target.value
                }))}
                fullWidth
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="location-label">Locación</InputLabel>
              <Select
                labelId="location-label"
                name="location"
                value={event.location}
                onChange={handleChange}
                label="Locación"
                fullWidth 
              >
                {locations.map(loc => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="services-label">Servicios</InputLabel>
              <Select
                labelId="services-label"
                multiple
                name="services"
                value={event.services}
                onChange={handleServicesChange}
                input={<OutlinedInput label="Servicios" />}
                renderValue={(selected) => 
                  services
                    .filter(service => selected.includes(service.id))
                    .map(service => service.name)
                    .join(', ')
                }
                fullWidth 
              >
                {services.map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    <Checkbox checked={event.services.indexOf(service.id) > -1} />
                    <ListItemText primary={service.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Estado</InputLabel>
                <Select
                  name="status"
                  value={event.status}
                  onChange={handleChange}
                  label="Estado"
                >
                  <MenuItem value="scheduled">Programado</MenuItem>
                  <MenuItem value="in_progress">En curso</MenuItem>
                  <MenuItem value="completed">Finalizado</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="URL de la Imagen"
                name="image"
                value={event.image || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>Datos del Cliente</Typography>
            </Grid>

            {['first_name', 'last_name', 'email', 'phone', 'address'].map(field => (
              <Grid item xs={12} md={field === 'address' ? 12 : 6} key={field}>
                <TextField
                  label={field === 'first_name' ? 'Nombre'
                        : field === 'last_name' ? 'Apellido'
                        : field === 'email' ? 'Correo'
                        : field === 'phone' ? 'Teléfono'
                        : 'Dirección'}
                  name={field}
                  value={event.owner[field]}
                  onChange={(e) =>
                    setEvent(prev => ({
                      ...prev,
                      owner: { ...prev.owner, [field]: e.target.value }
                    }))
                  }
                  fullWidth
                  margin="normal"
                />
              </Grid>
            ))}

            <Grid item xs={12} md={6}>
              <TextField
                label="Usuario"
                name="username"
                value={event.owner.username}
                onChange={(e) =>
                  setEvent(prev => ({
                    ...prev,
                    owner: { ...prev.owner, username: e.target.value }
                  }))
                }
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Contraseña"
                name="password"
                type="password"
                value={event.owner.password}
                onChange={(e) =>
                  setEvent(prev => ({
                    ...prev,
                    owner: { ...prev.owner, password: e.target.value }
                  }))
                }
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Repetir Contraseña"
                name="password2"
                type="password"
                value={event.owner.password2}
                onChange={(e) =>
                  setEvent(prev => ({
                    ...prev,
                    owner: { ...prev.owner, password2: e.target.value }
                  }))
                }
                fullWidth
                margin="normal"
              />
            </Grid>
              

            {previewImage && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={previewImage} 
                  alt="Vista previa" 
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Imagen'; 
                  }}// Si la URL es inválida, oculta la imagen
                />
              </Box>
            )}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/events')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : isEditMode ? 'Actualizar' : 'Guardar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EventForm;

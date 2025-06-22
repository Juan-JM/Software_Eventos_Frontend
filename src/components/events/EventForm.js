import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, FormControl, InputLabel,
  Select, MenuItem, CircularProgress, FormHelperText,
  Grid, Paper, Checkbox, FormControlLabel, ListItemText, OutlinedInput
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import es from 'date-fns/locale/es';
import api from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'completed', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // Estado del formulario
  const [event, setEvent] = useState({
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    location_id: '',
    is_package: false,
    service_ids: [],
    package_id: '',
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
  
  // Estado para opciones de selección
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  
  // Estado para manejo de errores y carga
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [previewImage, setPreviewImage] = useState('');
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [locationsRes, servicesRes, packagesRes] = await Promise.all([
          api.get('locations/'),
          api.get('services/'),
          api.get('packages/')
        ]);
        
        setLocations(locationsRes.data);
        setServices(servicesRes.data);
        setPackages(packagesRes.data);
        
        if (isEditMode) {
          const eventRes = await api.get(`events/${id}/`);
          const data = eventRes.data;
        
          setEvent({
            name: data.name || '',
            description: data.description || '',
            start_date: data.start_date ? new Date(data.start_date) : null,
            end_date: data.end_date ? new Date(data.end_date) : null,
            location_id: data.location?.id || '',
            is_package: data.is_package || false,
            service_ids: data.services ? data.services.map(service => service.id) : [],
            package_id: data.package?.id || '',
            status: data.status || 'scheduled',
            image: data.image || '',
            attendee_count: data.attendee_count || 0,
            owner: data.owner || {
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
        
          setPreviewImage(data.image || '');
        }
        
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditMode]);
  
  // Manejadores de cambios en campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Manejador especial para el checkbox is_package
  const handleIsPackageChange = (e) => {
    const isPackage = e.target.checked;
    
    // Actualizar el estado y limpiar el campo que no se usará
    setEvent(prev => ({
      ...prev,
      is_package: isPackage,
      // Limpiar service_ids si ahora es un paquete
      service_ids: isPackage ? [] : prev.service_ids,
      // Limpiar package_id si ahora son servicios
      package_id: isPackage ? prev.package_id : ''
    }));
  };
  
  // Manejador para cambios en fechas
  const handleDateChange = (field, date) => {
    setEvent(prev => ({ ...prev, [field]: date }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!event.name) newErrors.name = 'El nombre es obligatorio';
    if (!event.description) newErrors.description = 'La descripción es obligatoria';
    if (!event.start_date) newErrors.start_date = 'La fecha de inicio es obligatoria';
    if (!event.end_date) newErrors.end_date = 'La fecha de fin es obligatoria';
    if (!event.location_id) newErrors.location_id = 'La locación es obligatoria';
    
    // Validaciones específicas según is_package
    if (event.is_package) {
      if (!event.package_id) newErrors.package_id = 'Debe seleccionar un paquete';
    } else {
      if (!event.service_ids.length) newErrors.service_ids = 'Debe seleccionar al menos un servicio';
    }
    
    if (event.start_date && event.end_date && event.start_date > event.end_date) {
      newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
  
      const dataToSend = {
        name: event.name,
        description: event.description,
        start_date: event.start_date?.toISOString(),
        end_date: event.end_date?.toISOString(),
        location_id: event.location_id,
        is_package: event.is_package,
        status: event.status,
        image: event.image,
        attendee_count: parseInt(event.attendee_count || 0, 10),
        owner_data: event.owner
      };
      
      // Añadir los campos específicos según el tipo de evento
      if (event.is_package) {
        dataToSend.package_id = event.package_id;
      } else {
        dataToSend.service_ids = event.service_ids;
      }
      
      if (isEditMode) {
        await api.put(`events/${id}/`, dataToSend);
      } else {
        await api.post('events/', dataToSend);
      }
      
      navigate('/events');
    } catch (error) {
      console.error('Error al guardar evento:', error);
      
      if (error.response?.data) {
        setErrors(prev => ({ ...prev, ...error.response.data }));
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Editar Evento' : 'Nuevo Evento'}
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Nombre del evento */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                name="name"
                value={event.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
              />
            </Grid>
            
            {/* Descripción del evento */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={event.description}
                onChange={handleChange}
                error={Boolean(errors.description)}
                helperText={errors.description}
                multiline
                rows={4}
                required
              />
            </Grid>
            
            {/* Selección de fecha de inicio */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DateTimePicker
                  label="Fecha de inicio"
                  value={event.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: Boolean(errors.start_date),
                      helperText: errors.start_date
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Selección de fecha de fin */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DateTimePicker
                  label="Fecha de fin"
                  value={event.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: Boolean(errors.end_date),
                      helperText: errors.end_date
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Cantidad de asistentes */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cantidad de asistentes"
                name="attendee_count"
                type="number"
                value={event.attendee_count}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            {/* Selección de locación */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(errors.location_id)} required>
                <InputLabel>Locación</InputLabel>
                <Select
                  name="location_id"
                  value={event.location_id}
                  onChange={handleChange}
                  label="Locación"
                >
                  {locations.map(location => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.location_id && <FormHelperText>{errors.location_id}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* Estado del evento */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="status"
                  value={event.status}
                  onChange={handleChange}
                  label="Estado"
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* URL de la imagen */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL de la imagen"
                name="image"
                value={event.image}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Grid>

            {/* Tipo de servicio: Paquete o Servicios individuales */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={event.is_package}
                    onChange={handleIsPackageChange}
                    name="is_package"
                  />
                }
                label="Usar paquete de servicios"
              />
            </Grid>
            
            {/* Selector condicional: Paquete o Servicios individuales */}
            <Grid item xs={12}>
              {event.is_package ? (
                <FormControl fullWidth error={Boolean(errors.package_id)} required>
                  <InputLabel>Paquete de servicios</InputLabel>
                  <Select
                    name="package_id"
                    value={event.package_id}
                    onChange={handleChange}
                    label="Paquete de servicios"
                  >
                    {packages.map(pkg => (
                      <MenuItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.package_id && <FormHelperText>{errors.package_id}</FormHelperText>}
                </FormControl>
              ) : (
                <FormControl fullWidth error={Boolean(errors.service_ids)} required>
                  <InputLabel>Servicios</InputLabel>
                  <Select
                    multiple
                    name="service_ids"
                    value={event.service_ids}
                    onChange={handleChange}
                    input={<OutlinedInput label="Servicios" />}
                    renderValue={(selected) => {
                      const selectedNames = services
                        .filter(service => selected.includes(service.id))
                        .map(service => service.name);
                      return selectedNames.join(', ');
                    }}
                  >
                    {services.map(service => (
                      <MenuItem key={service.id} value={service.id}>
                        <Checkbox checked={event.service_ids.indexOf(service.id) > -1} />
                        <ListItemText primary={service.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.service_ids && <FormHelperText>{errors.service_ids}</FormHelperText>}
                </FormControl>
              )}
            </Grid>

            {/* Datos del Cliente */}
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
              />
            </Grid>

            {/* Vista previa de imagen */}
            {previewImage && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <img 
                    src={previewImage} 
                    alt="Vista previa" 
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Imagen'; 
                    }}
                  />
                </Box>
              </Grid>
            )}

            {/* Botones de acción */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/events')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Actualizar' : 'Crear')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default EventForm;
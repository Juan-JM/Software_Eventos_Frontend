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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    location_id: '',
    is_package: false, // Nuevo campo para indicar si es un paquete
    service_ids: [],
    package_id: '', // Nuevo campo para seleccionar un paquete
    status: 'scheduled',
    image: ''
  });
  
  // Estado para opciones de selección
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]); // Nuevo estado para paquetes
  
  // Estado para manejo de errores y carga
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [locationsRes, servicesRes, packagesRes] = await Promise.all([
          api.get('locations/'),
          api.get('services/'),
          api.get('packages/') // Cargar paquetes
        ]);
        
        setLocations(locationsRes.data);
        setServices(servicesRes.data);
        setPackages(packagesRes.data);
        
        if (isEditMode) {
          const eventRes = await api.get(`events/${id}/`);
          const eventData = eventRes.data;
          
          setFormData({
            name: eventData.name || '',
            description: eventData.description || '',
            start_date: eventData.start_date ? new Date(eventData.start_date) : null,
            end_date: eventData.end_date ? new Date(eventData.end_date) : null,
            location_id: eventData.location?.id || '',
            is_package: eventData.is_package || false,
            service_ids: eventData.services?.map(s => s.id) || [],
            package_id: eventData.package?.id || '',
            status: eventData.status || 'scheduled',
            image: eventData.image || ''
          });
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditMode]);
  
  // Manejadores de cambios en campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Manejador especial para el checkbox is_package
  const handleIsPackageChange = (e) => {
    const isPackage = e.target.checked;
    
    // Actualizar el estado y limpiar el campo que no se usará
    setFormData(prev => ({
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
    setFormData(prev => ({ ...prev, [field]: date }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'El nombre es obligatorio';
    if (!formData.description) newErrors.description = 'La descripción es obligatoria';
    if (!formData.start_date) newErrors.start_date = 'La fecha de inicio es obligatoria';
    if (!formData.end_date) newErrors.end_date = 'La fecha de fin es obligatoria';
    if (!formData.location_id) newErrors.location_id = 'La locación es obligatoria';
    
    // Validaciones específicas según is_package
    if (formData.is_package) {
      if (!formData.package_id) newErrors.package_id = 'Debe seleccionar un paquete';
    } else {
      if (!formData.service_ids.length) newErrors.service_ids = 'Debe seleccionar al menos un servicio';
    }
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
        location_id: formData.location_id,
        is_package: formData.is_package,
        status: formData.status,
        image: formData.image,
      };
      
      // Añadir los campos específicos según el tipo de evento
      if (formData.is_package) {
        dataToSend.package_id = formData.package_id;
      } else {
        dataToSend.service_ids = formData.service_ids;
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
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Nombre del evento */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
              />
            </Grid>
            
            {/* Selección de locación */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(errors.location_id)} required>
                <InputLabel>Locación</InputLabel>
                <Select
                  name="location_id"
                  value={formData.location_id}
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
            
            {/* Descripción del evento */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
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
                  value={formData.start_date}
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
                  value={formData.end_date}
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
            
            {/* Estado del evento */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
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
                value={formData.image}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Grid>
            
            {/* Tipo de servicio: Paquete o Servicios individuales */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_package}
                    onChange={handleIsPackageChange}
                    name="is_package"
                  />
                }
                label="Usar paquete de servicios"
              />
            </Grid>
            
            {/* Selector condicional: Paquete o Servicios individuales */}
            <Grid item xs={12}>
              {formData.is_package ? (
                <FormControl fullWidth error={Boolean(errors.package_id)} required>
                  <InputLabel>Paquete de servicios</InputLabel>
                  <Select
                    name="package_id"
                    value={formData.package_id}
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
                    value={formData.service_ids}
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
                        <Checkbox checked={formData.service_ids.indexOf(service.id) > -1} />
                        <ListItemText primary={service.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.service_ids && <FormHelperText>{errors.service_ids}</FormHelperText>}
                </FormControl>
              )}
            </Grid>
            
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
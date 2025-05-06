import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Box, Typography, MenuItem, FormControl, 
  Select, InputLabel, CircularProgress, Grid, Paper 
} from '@mui/material';
import api from '../../services/api';

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({
    name: '',
    description: '',
    address: '',
    capacity: '',
    location_type: 'salon',
    rental_price: '',
    price_unit: 'event',
    area_sqm: '',
    parking_spaces: '',
    environment_type: 'cerrado',
    extra_hour_cost: '',
    provider: ''
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    const loadLocation = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await api.get(`locations/${id}/`);
          setLocation(response.data);
        } catch (err) {
          setError('Error al cargar la locación: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadLocation();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Preparar los datos para enviar
      const locationData = {
        ...location,
        capacity: parseInt(location.capacity),
        rental_price: parseFloat(location.rental_price),
        area_sqm: parseInt(location.area_sqm),
        parking_spaces: parseInt(location.parking_spaces),
        extra_hour_cost: parseFloat(location.extra_hour_cost)
      };

      if (isEditMode) {
        await api.put(`locations/${id}/`, locationData);
      } else {
        await api.post('locations/', locationData);
      }
      
      navigate('/locations');
    } catch (err) {
      setError('Error al guardar la locación: ' + err.message);
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
        {isEditMode ? 'Editar Locación' : 'Nueva Locación'}
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre de la locación"
                name="name"
                value={location.name}
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
                value={location.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Dirección"
                name="address"
                value={location.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de locación</InputLabel>
                <Select
                  name="location_type"
                  value={location.location_type}
                  onChange={handleChange}
                  label="Tipo de locación"
                >
                  <MenuItem value="salon">Salón</MenuItem>
                  <MenuItem value="jardin">Jardín</MenuItem>
                  <MenuItem value="playa">Playa</MenuItem>
                  <MenuItem value="auditorio">Auditorio</MenuItem>
                  <MenuItem value="terraza">Terraza</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de ambiente</InputLabel>
                <Select
                  name="environment_type"
                  value={location.environment_type}
                  onChange={handleChange}
                  label="Tipo de ambiente"
                >
                  <MenuItem value="cerrado">Cerrado</MenuItem>
                  <MenuItem value="abierto">Abierto</MenuItem>
                  <MenuItem value="semiabierto">Semiabierto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Capacidad (personas)"
                name="capacity"
                value={location.capacity}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 1 }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Área (m²)"
                name="area_sqm"
                value={location.area_sqm}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 1 }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Estacionamiento (vehículos)"
                name="parking_spaces"
                value={location.parking_spaces}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0 }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Precio de alquiler"
                name="rental_price"
                value={location.rental_price}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Unidad de medida del precio</InputLabel>
                <Select
                  name="price_unit"
                  value={location.price_unit}
                  onChange={handleChange}
                  label="Unidad de medida del precio"
                >
                  <MenuItem value="event">Por Evento</MenuItem>
                  <MenuItem value="hour">Por Hora</MenuItem>
                  <MenuItem value="day">Por Día</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Costo por hora extra"
                name="extra_hour_cost"
                value={location.extra_hour_cost}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Proveedor asociado"
                name="provider"
                value={location.provider || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
                helperText="Dejar en blanco si la locación es propia"
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/locations')}
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

export default LocationForm;
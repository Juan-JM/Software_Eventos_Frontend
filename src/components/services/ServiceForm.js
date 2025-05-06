import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Box, Typography, MenuItem, FormControl, 
  Select, InputLabel, CircularProgress, Grid, Paper 
} from '@mui/material';
import { createService, getServiceById, updateService } from '../../services/service.service';

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [service, setService] = useState({
    name: '',
    description: '',
    base_price: '',
    unit_measure: 'event',
    standard_duration: '',
    provider: ''
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    const loadService = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await getServiceById(id);
          setService(response.data);
        } catch (err) {
          setError('Error al cargar el servicio: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadService();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Preparar los datos para enviar
      const serviceData = {
        ...service,
        base_price: parseFloat(service.base_price),
        standard_duration: service.standard_duration ? parseInt(service.standard_duration) : null
      };

      if (isEditMode) {
        await updateService(id, serviceData);
      } else {
        await createService(serviceData);
      }
      
      navigate('/services');
    } catch (err) {
      setError('Error al guardar el servicio: ' + err.message);
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
        {isEditMode ? 'Editar Servicio' : 'Nuevo Servicio'}
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
                label="Nombre"
                name="name"
                value={service.name}
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
                value={service.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Precio Base"
                name="base_price"
                value={service.base_price}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Unidad de Medida</InputLabel>
                <Select
                  name="unit_measure"
                  value={service.unit_measure}
                  onChange={handleChange}
                  label="Unidad de Medida"
                >
                  <MenuItem value="event">Por Evento</MenuItem>
                  <MenuItem value="hour">Por Hora</MenuItem>
                  <MenuItem value="person">Por Persona</MenuItem>
                  <MenuItem value="day">Por Día</MenuItem>
                  <MenuItem value="unit">Por Unidad</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Duración Estándar (minutos)"
                name="standard_duration"
                value={service.standard_duration || ''}
                onChange={handleChange}
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                margin="normal"
                helperText="Dejar en blanco si no aplica"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Proveedor"
                name="provider"
                value={service.provider}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/services')}
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

export default ServiceForm;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProvider, updateProvider, getProviderById } from '../../services/providers.service';
import { 
  TextField, Button, Box, Typography, CircularProgress, Grid, 
  Paper, FormControlLabel, Checkbox, Divider
} from '@mui/material';

const ProviderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    commercial_name: '',
    contact_name: '',
    contact_phone: '',
    email: '',
    website: '',
    address: '',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    if (isEditMode) {
      fetchProvider();
    }
  }, [id, isEditMode]);

  const fetchProvider = async () => {
    try {
      setLoading(true);
      const response = await getProviderById(id);
      
      // Asegurar que los campos null se conviertan en strings vacíos
      setFormData({
        ...response.data,
        website: response.data.website || '',
        address: response.data.address || '',
        notes: response.data.notes || ''
      });
    } catch (err) {
      setError('Error al cargar los datos del proveedor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.commercial_name?.trim()) {
      setError('El nombre comercial es obligatorio');
      return false;
    }
    if (!formData.contact_name?.trim()) {
      setError('El nombre del contacto principal es obligatorio');
      return false;
    }
    if (!formData.contact_phone?.trim()) {
      setError('El teléfono de contacto es obligatorio');
      return false;
    }
    if (!formData.email?.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El formato del correo electrónico no es válido');
      return false;
    }
    
    // Validar formato de URL si se proporciona website
    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        setError('El formato del sitio web no es válido. Debe incluir http:// o https://');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // Limpiar website si está vacío - usando operador de encadenamiento opcional
      const dataToSubmit = {
        ...formData,
        website: formData.website?.trim() || null,
        address: formData.address?.trim() || null,
        notes: formData.notes?.trim() || null
      };

      if (isEditMode) {
        await updateProvider(id, dataToSubmit);
      } else {
        await createProvider(dataToSubmit);
      }
      
      navigate('/providers');
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Respuesta del servidor:', err.response?.data);
      
      let errorMessage = 'Error al guardar el proveedor: ';
      
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
        {isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Información Básica */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre comercial"
                name="commercial_name"
                value={formData.commercial_name || ''}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                helperText="Nombre comercial del proveedor"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre del contacto principal"
                name="contact_name"
                value={formData.contact_name || ''}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                helperText="Persona de contacto principal"
              />
            </Grid>

            {/* Información de Contacto */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Información de Contacto
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Teléfono de contacto"
                name="contact_phone"
                value={formData.contact_phone || ''}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                helperText="Teléfono del proveedor"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Correo electrónico"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                fullWidth
                required
                type="email"
                margin="normal"
                helperText="Correo electrónico del proveedor"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Sitio web (opcional)"
                name="website"
                value={formData.website || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                placeholder="https://ejemplo.com"
                helperText="Sitio web del proveedor (incluir http:// o https://)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Dirección física (opcional)"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                helperText="Dirección física del proveedor"
              />
            </Grid>

            {/* Información Adicional */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Información Adicional
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notas (opcional)"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                helperText="Notas adicionales sobre el proveedor"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_active"
                    checked={formData.is_active || false}
                    onChange={handleInputChange}
                  />
                }
                label="Proveedor activo"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/providers')}
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

export default ProviderForm;
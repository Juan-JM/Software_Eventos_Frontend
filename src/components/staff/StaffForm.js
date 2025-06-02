import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createStaff, updateStaff, getStaffById } from '../../services/staff.service';
import { 
  TextField, Button, Box, Typography, MenuItem, FormControl, 
  Select, InputLabel, CircularProgress, Grid, Paper, FormControlLabel,
  Checkbox, Avatar, IconButton, Divider
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';

const StaffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    identity_document: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    position: '',
    hire_date: '',
    is_active: true,
    photo: null
  });

  const positionChoices = [
    { value: 'tecnico', label: 'Técnico' },
    { value: 'logistica', label: 'Logística' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'coordinador', label: 'Coordinador' },
    { value: 'catering', label: 'Catering' },
    { value: 'audiovisual', label: 'Audiovisual' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'decoracion', label: 'Decoración' },
    { value: 'otro', label: 'Otro' }
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchStaff();
    }
  }, [id, isEditMode]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await getStaffById(id);
      const staffData = response.data;
      
      setFormData({
        ...staffData,
        birth_date: staffData.birth_date,
        hire_date: staffData.hire_date,
        photo: null
      });

      if (staffData.photo) {
        setPreview(staffData.photo);
      }
    } catch (err) {
      setError('Error al cargar los datos del personal: ' + err.message);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        photo: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: null
    }));
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await updateStaff(id, formData);
      } else {
        await createStaff(formData);
      }
      
      navigate('/staff');
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Respuesta del servidor:', err.response?.data);
      
      let errorMessage = 'Error al guardar el personal: ';
      
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
        {isEditMode ? 'Editar Personal' : 'Nuevo Personal'}
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Foto del personal */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={preview}
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {formData.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PhotoCamera />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar
                  </Button>
                  {preview && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={removePhoto}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  Formatos: JPG, PNG. Máximo 5MB
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nombre completo"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Documento de identidad"
                    name="identity_document"
                    value={formData.identity_document}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Fecha de nacimiento"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Información de contacto */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Información de Contacto
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Correo electrónico"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                type="email"
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>

            {/* Información laboral */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Información Laboral
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Puesto o rol</InputLabel>
                <Select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  label="Puesto o rol"
                  required
                >
                  {positionChoices.map(choice => (
                    <MenuItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha de ingreso"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleInputChange}
                fullWidth
                required
                type="date"
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                }
                label="Personal activo"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/staff')}
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

export default StaffForm;
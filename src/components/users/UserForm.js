// frontend/src/components/users/UserForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../services/user.service';
import {
  Container, Typography, Box, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';

const UserForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    user_type: 'customer',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación básica
    if (formData.password !== formData.password2) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      await createUser(formData);
      navigate('/users');
    } catch (err) {
      if (err.response && err.response.data) {
        let errorMessages = '';
    
        try {
          const data = err.response.data;
    
          if (typeof data === 'object' && !Array.isArray(data)) {
            errorMessages = Object.entries(data).map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              } else if (typeof value === 'string') {
                return `${key}: ${value}`;
              } else {
                return `${key}: ${JSON.stringify(value)}`;
              }
            }).join('\n');
          } else if (typeof data === 'string') {
            errorMessages = data;
          } else {
            errorMessages = 'Ocurrió un error desconocido.';
          }
        } catch (parseErr) {
          errorMessages = 'Error al interpretar el mensaje del servidor.';
        }
    
        setError(errorMessages);
      } else {
        setError('Error al crear el usuario. Por favor, inténtalo de nuevo.');
      }
    }
  }

  //   } catch (err) {
  //     if (err.response && err.response.data) {
  //       // Mostrar errores de validación del servidor
  //       const errorMessages = Object.entries(err.response.data)
  //         // .map(([key, value]) => `${key}: ${value.join(', ')}`)
  //         .map(([key, value]) => {
  //           if (Array.isArray(value)) {
  //             return `${key}: ${value.join(', ')}`;
  //           } else if (typeof value === 'string') {
  //             return `${key}: ${value}`;
  //           } else {
  //             return `${key}: ${JSON.stringify(value)}`;
  //           }
  //         })
  //         .join('\n');
  //       setError(errorMessages);
  //     } else {
  //       setError('Error al crear el usuario. Por favor, inténtalo de nuevo.');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4">Crear Nuevo Usuario</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="username"
                label="Nombre de usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="email"
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="first_name"
                label="Nombre"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="last_name"
                label="Apellido"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password2"
                label="Confirmar contraseña"
                type="password"
                id="password2"
                value={formData.password2}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="user-type-label">Tipo de usuario</InputLabel>
                <Select
                  labelId="user-type-label"
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  label="Tipo de usuario"
                >
                  <MenuItem value="customer">Cliente</MenuItem>
                  <MenuItem value="staff">Personal</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="address"
                label="Dirección"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/users')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              Crear Usuario
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default UserForm;
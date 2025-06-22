// frontend/src/components/auth/Register.js
import React, { useState } from 'react';
import { register } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Typography, Container, Box, Alert,
  Select, MenuItem, InputLabel, FormControl, Grid, Paper, Divider
} from '@mui/material';
import {
  EventNote,
  PersonAdd,
  Person,
  Email,
  Lock,
  Phone,
  Home,
  SupervisorAccount
} from '@mui/icons-material';

const Register = () => {
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
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
    setSuccess('');
    
    try {
      await register(formData);
      setSuccess('Registro exitoso. Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMsg = Object.values(err.response.data).flat().join(', ');
        setError(errorMsg || 'Error en el registro. Por favor, inténtalo de nuevo.');
      } else {
        setError('Error en el registro. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#ffffff',
        py: 4
      }}
    >
      <Container component="main" maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Header con branding */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 4,
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '150px',
                height: '150px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(50%, -50%)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <EventNote sx={{ fontSize: 50, color: '#fbbf24', mb: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #fbbf24, #ffffff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                PlanitOne
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  opacity: 0.9,
                  fontWeight: 300
                }}
              >
                Únete a la mejor plataforma de gestión de eventos
              </Typography>
            </Box>
          </Box>

          {/* Formulario */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#1f2937',
                  mb: 1
                }}
              >
                Crear Nueva Cuenta
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#6b7280'
                }}
              >
                Completa tus datos para empezar a gestionar eventos
              </Typography>
            </Box>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2
                }}
              >
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2
                }}
              >
                {success}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Información básica */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#374151',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Person sx={{ mr: 1, color: '#667eea' }} />
                    Información Personal
                  </Typography>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
                  />
                </Grid>

                {/* Información de cuenta */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#374151',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Lock sx={{ mr: 1, color: '#667eea' }} />
                    Datos de Cuenta
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="Nombre de usuario"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl 
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
                  >
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

                {/* Información adicional */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#374151',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Phone sx={{ mr: 1, color: '#667eea' }} />
                    Información de Contacto (Opcional)
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    label="Teléfono"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<PersonAdd />}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Registrarse
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#6b7280'
                }}
              >
                ¿Ya tienes una cuenta?{' '}
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#667eea',
                    fontWeight: 600,
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#5a67d8',
                    }
                  }}
                >
                  Inicia sesión aquí
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
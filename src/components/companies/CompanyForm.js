import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField, Button, Box, Typography, Paper, Grid, CircularProgress, Switch, FormControlLabel
} from '@mui/material';
import api from '../../services/api';

const CompanyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [company, setCompany] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminData, setAdminData] = useState({
    admin_username: '',
    admin_email: '',
    admin_password: '',
  });
  
  useEffect(() => {
    const fetchCompany = async () => {
      if (!isEditMode) return;
      setLoading(true);
      try {
        const response = await api.get(`companies/${id}/`);
        setCompany(response.data);
      } catch (err) {
        setError('Error al cargar la empresa: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };
  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };
  const handleSwitchChange = (e) => {
    setCompany(prev => ({ ...prev, is_active: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        // EDITAR: solo los datos de la empresa
        await api.put(`companies/${id}/`, company);
      } else {
        // CREAR: empresa + datos del admin
        await api.post('companies/', { ...company, ...adminData });
      }
      navigate('/companies');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Error al guardar la empresa: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  

  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEditMode ? 'Editar Empresa' : 'Nueva Empresa'}
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre"
                name="name"
                value={company.name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="description"
                value={company.description}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Sitio Web"
                name="website"
                value={company.website}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Logo (URL)"
                name="logo_url"
                value={company.logo_url}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={company.is_active}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Empresa activa"
              />
            </Grid>
            {!isEditMode && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Usuario Admin"
                      name="admin_username"
                      value={adminData.admin_username}
                      onChange={handleAdminChange}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email Admin"
                      name="admin_email"
                      type="email"
                      value={adminData.admin_email}
                      onChange={handleAdminChange}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Contraseña Admin"
                      name="admin_password"
                      type="password"
                      value={adminData.admin_password}
                      onChange={handleAdminChange}
                      required
                      fullWidth
                    />
                  </Grid>
                </>
              )}

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/companies')}>Cancelar</Button>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Guardar'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CompanyForm;

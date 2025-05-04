import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, Grid, CircularProgress, Button, Divider
} from '@mui/material';
import api from '../../services/api';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
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
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !company) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || 'Empresa no encontrada'}</Typography>
        <Button component={Link} to="/companies" sx={{ mt: 2 }}>Volver al listado</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Empresa: {company.name}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/companies/${id}/edit`)}
        >
          Editar
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {company.logo_url && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  src={company.logo_url}
                  alt="Logo de la empresa"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Descripción</Typography>
            <Typography>{company.description || 'Sin descripción'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Sitio Web</Typography>
            <Typography>
              {company.website ? (
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  {company.website}
                </a>
              ) : 'Sin sitio web'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Estado</Typography>
            <Typography>{company.is_active ? 'Activa' : 'Inactiva'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Fecha de creación</Typography>
            <Typography>{new Date(company.created_at).toLocaleString()}</Typography>
          </Grid>

          <Grid item xs={12} sx={{ textAlign: 'right' }}>
            <Button component={Link} to="/companies" color="primary">
              Volver al listado
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CompanyDetail;

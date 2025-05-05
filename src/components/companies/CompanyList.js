import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Box, Typography, CircularProgress
} from '@mui/material';
import api from '../../services/api';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('companies/');
      setCompanies(response.data);
    } catch (err) {
      setError('Error al cargar las empresas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Empresas</Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/companies/new"
        >
          Crear Empresa
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {companies.length === 0 ? (
        <Typography>No hay empresas registradas.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Sitio Web</TableCell>
                <TableCell>Activo</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.website || '—'}</TableCell>
                  <TableCell>{company.is_active ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/companies/${company.id}`}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Ver
                    </Button>
                    <Button
                      component={Link}
                      to={`/companies/${company.id}/edit`}
                      size="small"
                      color="primary"
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CompanyList;

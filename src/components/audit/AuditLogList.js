// frontend/src/components/audit/AuditLogList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TextField, Button, Box, FormControl, InputLabel,
  Select, MenuItem, Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

const AuditLogList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    content_type: '',
    start_date: null,
    end_date: null
  });

  useEffect(() => {
    // Verificar si el usuario es admin
    if (!currentUser || currentUser.user_type !== 'admin') {
      navigate('/unauthorized');
      return;
    }

    fetchLogs();
  }, [currentUser, navigate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.content_type) params.append('content_type', filters.content_type);
      if (filters.start_date) params.append('start_date', filters.start_date.format('YYYY-MM-DD'));
      if (filters.end_date) params.append('end_date', filters.end_date.format('YYYY-MM-DD'));
  // const response = await api.get(`/audit/logs/${params.toString() ? '?' + params.toString() : ''}`);

  const response = await api.get(`/audit/audit/${params.toString() ? '?' + params.toString() : ''}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      action: '',
      content_type: '',
      start_date: null,
      end_date: null
    });
  };

  const formatChanges = (changesString) => {
    try {
      const changes = JSON.parse(changesString);
      return Object.entries(changes).map(([field, [old_value, new_value]]) => {
        const formatValue = (value) => {
          if (value === null || value === undefined) return "N/A";
          if (typeof value === 'object') return JSON.stringify(value); 
          return String(value);
        };
        
        return (
          <div key={field}>
            <strong>{field}:</strong> {formatValue(old_value)} → {formatValue(new_value)}
          </div>
        );
      });
    } catch (e) {
      return changesString && typeof changesString === 'object' ? 
        JSON.stringify(changesString) : 
        String(changesString || '');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Bitácora del Sistema
      </Typography>

      {/* Filtros */}
      <Paper style={{ padding: '16px', marginBottom: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Acción</InputLabel>
                <Select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  label="Acción"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="0">Crear</MenuItem>
                  <MenuItem value="1">Actualizar</MenuItem>
                  <MenuItem value="2">Eliminar</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Tipo de Contenido</InputLabel>
                <Select
                  value={filters.content_type}
                  onChange={(e) => handleFilterChange('content_type', e.target.value)}
                  label="Tipo de Contenido"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="user">Usuario</MenuItem>
                  <MenuItem value="product">Producto</MenuItem>
                  <MenuItem value="cartitem">Elemento del Carrito</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Fecha Inicio"
                value={filters.start_date}
                onChange={(date) => handleFilterChange('start_date', date)}
                slotProps={{ textField: { fullWidth: true, size: "small", variant: "outlined" } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Fecha Fin"
                value={filters.end_date}
                onChange={(date) => handleFilterChange('end_date', date)}
                slotProps={{ textField: { fullWidth: true, size: "small", variant: "outlined" } }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={resetFilters} 
            style={{ marginRight: '8px' }}
          >
            Limpiar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={applyFilters}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </Paper>

      {/* Tabla de logs */}
      {loading ? (
        <Typography>Cargando registros...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha/Hora</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Acción</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Objeto</TableCell>
                <TableCell>Direccion IP</TableCell>

                <TableCell>Cambios</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron registros.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.actor || 'Sistema'}</TableCell>
                    <TableCell>
                      {log.action === '0' ? 'Crear' : 
                       log.action === '1' ? 'Actualizar' : 
                       log.action === '2' ? 'Eliminar' : log.action}
                    </TableCell>
                    {/* <TableCell>{log.content_type?.model || log.content_type}</TableCell> */}
                    <TableCell>{log.model || log.content_type}</TableCell>
                    <TableCell>{log.object_id}</TableCell>
                    <TableCell>{log.ip_address}</TableCell>

                    <TableCell>{formatChanges(log.detail)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default AuditLogList;
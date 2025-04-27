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
import { getAllUsers } from '../../services/user.service';

const AuditLogList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]); // Nuevo estado para los usuarios
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true); // Estado para carga de usuarios
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    start_date: null,
    end_date: null
  });

  useEffect(() => {
    if (!currentUser || currentUser.user_type !== 'admin') {
      navigate('/unauthorized');
      return;
    }

    // Cargar usuarios y logs en paralelo
    const loadData = async () => {
      try {
        setLoading(true);
        setUserLoading(true);

        const [usersResponse] = await Promise.all([
          getAllUsers(),
          fetchLogs() // fetchLogs ya se llama aquí
        ]);

        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setUserLoading(false);
      }
    };

    loadData();
  }, [currentUser, navigate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      // if (filters.content_type) params.append('content_type', filters.content_type);
      // En el método fetchLogs del frontend:
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.start_date && dayjs(filters.start_date).isValid())
        params.append('start_date', filters.start_date.format('YYYY-MM-DD'));
      if (filters.end_date && dayjs(filters.end_date).isValid())
        params.append('end_date', filters.end_date.format('YYYY-MM-DD'));  // const response = await api.get(`/audit/logs/${params.toString() ? '?' + params.toString() : ''}`);

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
      user_id: '',
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
              <Typography variant="body2" sx={{ mb: 1 }}>Acción</Typography>
              <Select
                fullWidth
                size="small"
                variant="outlined"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                displayEmpty
                sx={{ width: '100%' }}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="CREATE">Crear</MenuItem>
                <MenuItem value="UPDATE">Actualizar</MenuItem>
                <MenuItem value="DELETE">Eliminar</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Usuario</Typography>
              <Select
                fullWidth
                size="small"
                variant="outlined"
                value={filters.user_id}
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                displayEmpty
                disabled={userLoading}
                sx={{ width: '100%' }}
              >
                <MenuItem value="">Todos</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.username || `Usuario ${user.id}`}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Fecha Inicio</Typography>
              <DatePicker
                value={filters.start_date}
                onChange={(date) => handleFilterChange('start_date', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    variant: "outlined",
                    label: "" // Elimina el label interno del DatePicker
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Fecha Fin</Typography>
              <DatePicker
                value={filters.end_date}
                onChange={(date) => handleFilterChange('end_date', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    variant: "outlined",
                    label: "" // Elimina el label interno del DatePicker
                  }
                }}
              />
            </Grid>
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
          </Grid>
        </LocalizationProvider>

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
                    <TableCell>{log.user_name || 'Sistema'}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.model}</TableCell>
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
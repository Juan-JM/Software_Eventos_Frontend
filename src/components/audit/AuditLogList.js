// frontend/src/components/audit/AuditLogList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TextField, Button, Box, FormControl, InputLabel,
  Select, MenuItem, Grid, Menu, IconButton, Tooltip, Snackbar, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { getAllUsers } from '../../services/user.service';
import { 
  generateAuditCsvReport, 
  generateAuditExcelReport, 
  generateAuditPdfReport 
} from '../../services/report.service';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';

const AuditLogList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    start_date: null,
    end_date: null
  });
  
  // Estado para controlar el menú desplegable de exportación
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Estado para snackbar de notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (!currentUser || !['admin', 'superadmin'].includes(currentUser.user_type)) {
      navigate('/unauthorized');
      return;
    }
  
    const loadData = async () => {
      try {
        setLoading(true);
        setUserLoading(true);
    
        let usersResponse;
    
        if (currentUser.user_type === 'superadmin') {
          usersResponse = await getAllUsers();
        } else {
          usersResponse = await api.get('/users/', {
            params: { company: currentUser.company }
          });
        }
    
        setUsers(usersResponse.data);
        await fetchLogs();
      } catch (error) {
        console.error('Error loading data:', error);
        showSnackbar('Error al cargar los datos', 'error');
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
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.start_date && dayjs(filters.start_date).isValid())
        params.append('start_date', filters.start_date.format('YYYY-MM-DD'));
      if (filters.end_date && dayjs(filters.end_date).isValid())
        params.append('end_date', filters.end_date.format('YYYY-MM-DD'));

      const response = await api.get(`/audit/${params.toString() ? '?' + params.toString() : ''}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      showSnackbar('Error al obtener los registros', 'error');
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
  
  // Función para mostrar el menú de exportación
  const handleExportClick = (event) => {
    setExportMenuAnchorEl(event.currentTarget);
  };
  
  // Función para cerrar el menú de exportación
  const handleExportClose = () => {
    setExportMenuAnchorEl(null);
  };
  
  // Función para exportar en un formato específico
  const handleExport = async (format) => {
    setExportLoading(true);
    if (exportMenuAnchorEl) handleExportClose();
    
    try {
      // Preparar los filtros
      const exportFilters = {
        action: filters.action || '',
        user_id: filters.user_id || '',
        start_date: filters.start_date ? filters.start_date.format('YYYY-MM-DD') : '',
        end_date: filters.end_date ? filters.end_date.format('YYYY-MM-DD') : ''
      };
      
      // Generar el reporte según el formato
      let result;
      switch (format) {
        case 'csv':
          result = await generateAuditCsvReport(exportFilters);
          break;
        case 'excel':
          result = await generateAuditExcelReport(exportFilters);
          break;
        case 'pdf':
          result = await generateAuditPdfReport(exportFilters);
          break;
        default:
          throw new Error('Formato no soportado');
      }
      
      showSnackbar(result.message || 'Reporte generado con éxito', 'success');
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      showSnackbar(`Error al exportar a ${format}`, 'error');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Función para mostrar notificaciones
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Función para cerrar el snackbar
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
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
                <MenuItem value="LOGIN">Inicio de sesión</MenuItem>
                <MenuItem value="LOGOUT">Cierre de sesión</MenuItem>
                <MenuItem value="VIEW">Visualizar</MenuItem>
                <MenuItem value="OTHER">Otro</MenuItem>
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
                    label: ""
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Fecha Fin
              </Typography>
              <DatePicker
                value={filters.end_date}
                onChange={(date) => handleFilterChange('end_date', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    variant: "outlined",
                    label: ""
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
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
                  style={{ marginRight: '8px' }}
                >
                  Aplicar Filtros
                </Button>
                
                {/* Botones de exportación simples */}
                <Button
                  variant="contained" 
                  color="success"
                  onClick={() => handleExport('csv')}
                  style={{ marginRight: '8px' }}
                >
                  CSV
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleExport('excel')}
                  style={{ marginRight: '8px' }}
                >
                  Excel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleExport('pdf')}
                >
                  PDF
                </Button>
              </Box>
            </Grid>
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
                <TableCell>Dirección IP</TableCell>
                <TableCell>Cambios</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
      
      {/* Snackbar para notificaciones */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AuditLogList;
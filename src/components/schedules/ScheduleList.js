import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllSchedules, deleteSchedule } from '../../services/schedules.service';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, InputAdornment, Chip, LinearProgress
} from '@mui/material';
import { Search, Event, Schedule as ScheduleIcon, AccessTime } from '@mui/icons-material';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await getAllSchedules();
      setSchedules(response.data);
      setFilteredSchedules(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los cronogramas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    const filtered = schedules.filter(schedule =>
      schedule.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.event_location && schedule.event_location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSchedules(filtered);
  }, [searchTerm, schedules]);

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSchedule(scheduleToDelete.id);
      setSchedules(schedules.filter(s => s.id !== scheduleToDelete.id));
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    } catch (err) {
      setError('Error al eliminar el cronograma: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setScheduleToDelete(null);
  };

  const getProgressPercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'success';
    if (percentage >= 50) return 'info';
    if (percentage > 0) return 'warning';
    return 'error';
  };

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
        <Typography variant="h4">Gestión de Cronogramas</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/schedules/new"
        >
          Nuevo Cronograma
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre del evento o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredSchedules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchTerm ? 'No se encontraron resultados' : 'No hay cronogramas registrados'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Crea tu primer cronograma para comenzar a organizar las actividades de tus eventos'
            }
          </Typography>
          {!searchTerm && (
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to="/schedules/new"
              startIcon={<ScheduleIcon />}
            >
              Crear Cronograma
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Evento</TableCell>
                <TableCell>Fecha del Evento</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Horario del Cronograma</TableCell>
                <TableCell>Progreso</TableCell>
                <TableCell>Actividades</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSchedules.map((schedule) => {
                const progressPercentage = getProgressPercentage(
                  schedule.completed_activities, 
                  schedule.total_activities
                );
                
                return (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Event sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {schedule.event_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(schedule.event_date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {schedule.event_location || 'Sin ubicación'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2">
                            {schedule.start_time} - {schedule.end_time}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {progressPercentage}%
                          </Typography>
                          <Chip 
                            label={`${schedule.completed_activities}/${schedule.total_activities}`}
                            size="small"
                            color={getProgressColor(progressPercentage)}
                          />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={progressPercentage}
                          color={getProgressColor(progressPercentage)}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {schedule.total_activities} actividades
                      </Typography>
                      {schedule.total_activities > 0 && (
                        <Typography variant="caption" color="textSecondary">
                          {schedule.completed_activities} completadas
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        component={Link} 
                        to={`/schedules/${schedule.id}`} 
                        color="primary" 
                        size="small" 
                        sx={{ mr: 1 }}
                      >
                        Ver
                      </Button>
                      <Button 
                        component={Link} 
                        to={`/schedules/${schedule.id}/edit`} 
                        color="secondary" 
                        size="small" 
                        sx={{ mr: 1 }}
                      >
                        Editar
                      </Button>
                      <Button 
                        onClick={() => handleDeleteClick(schedule)} 
                        color="error" 
                        size="small"
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el cronograma de "{scheduleToDelete?.event_name}"? 
            Esta acción eliminará también todas las actividades asociadas y no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleList;
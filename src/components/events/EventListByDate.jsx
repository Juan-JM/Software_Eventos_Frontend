
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Select, MenuItem, InputLabel, FormControl,
  Grid, Paper, CircularProgress, Button, IconButton, Popover
} from '@mui/material';
import { Link } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { isSameDay, eachDayOfInterval } from 'date-fns';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const EventListByDate = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpenCalendar = (e) => setAnchorEl(e.currentTarget);
  const handleCloseCalendar = () => setAnchorEl(null);
 //nuevo 
 const navigate = useNavigate();
  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsRes, locationsRes] = await Promise.all([
          api.get('events/'),
          api.get('locations/')
        ]);

        const sorted = eventsRes.data
          .slice()
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        setEvents(sorted);
        setFilteredEvents(sorted);
        setLocations(locationsRes.data);
      } catch (err) {
        console.error('Error cargando eventos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event => {
      const matchName = event.name.toLowerCase().includes(search.toLowerCase());
      const matchLocation = locationFilter ? event.location?.id === locationFilter : true;
      const matchStatus = statusFilter ? event.status === statusFilter : true;
      return matchName && matchLocation && matchStatus;
    });
    setFilteredEvents(filtered);
  }, [search, locationFilter, statusFilter, events]);

  // Fechas ocupadas como Set de strings
  const occupiedDates = useMemo(() => {
    let dates = [];
    events.forEach(evt => {
      const start = new Date(evt.start_date);
      const end = new Date(evt.end_date);
      const range = eachDayOfInterval({ start, end });
      dates = [...dates, ...range.map(d => d.toDateString())];
    });
    return new Set(dates);
  }, [events]);

  const statusLabels = {
    scheduled: 'Programado',
    in_progress: 'En curso',
    completed: 'Finalizado',
    cancelled: 'Cancelado'
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  //nuevo 


const handleDoubleClickDate = (date) => {
  const clickedDateStr = date.toDateString();

  const matchingEvent = events.find(evt => {
    const start = new Date(evt.start_date);
    const end = new Date(evt.end_date);
    const range = eachDayOfInterval({ start, end });
    return range.some(d => d.toDateString() === clickedDateStr);
  });

  if (matchingEvent) {
    navigate(`/events/${matchingEvent.id}`);
  } else {
    alert('No hay eventos en esa fecha');
  }
};

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handleOpenCalendar}>
          <CalendarTodayIcon color="primary" />
        </IconButton>
        <Typography sx={{ ml: 1 }}>Ver fechas ocupadas</Typography>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleCloseCalendar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 2 }}>

              <DateCalendar
                readOnly
                slots={{
                  day: ({ day, selected, outsideCurrentMonth, today, ...props }) => {
                    const isOccupied = occupiedDates.has(day.toDateString());
                    return (
                      <div
                        onDoubleClick={() => handleDoubleClickDate(day)}
                        style={{
                          backgroundColor: isOccupied ? '#ffcccc' : undefined,
                          color: isOccupied ? 'black' : undefined,
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        {day.getDate()}
                      </div>
                    );
                  }
                }}
              />


          </Box>
        </Popover>
      </Box>

      <Typography variant="h4" gutterBottom>Lista de eventos</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Buscar por nombre"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filtrar por locación</InputLabel>
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              label="Filtrar por locación"
            >
              <MenuItem value="">Todas</MenuItem>
              {locations.map(loc => (
                <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filtrar por estado</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filtrar por estado"
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {filteredEvents.length === 0 ? (
        <Typography>No hay eventos que coincidan con los filtros.</Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredEvents.map(event => (
            <Grid item xs={12} md={6} key={event.id}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">{event.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(event.start_date).toLocaleString()} – {new Date(event.end_date).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Locación:</strong> {event.location?.name || 'Sin locación'}
                </Typography>
                <Typography variant="body2">
                  <strong>Estado:</strong> {statusLabels[event.status]}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button component={Link} to={`/events/${event.id}`} variant="outlined" size="small">
                    Ver detalle
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EventListByDate;

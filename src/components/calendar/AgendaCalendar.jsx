// components/calendar/AgendaCalendar.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parseISO, format, startOfWeek, getDay } from 'date-fns';
import esES from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const locales = {
  'es': esES,
};

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const AgendaCalendar = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await api.get('events/');
        const mapped = res.data.map(event => ({
          id: event.id,
          title: event.name,
          start: new Date(event.start_date),
          end: new Date(event.end_date),
          resource: event,
        }));
        setEvents(mapped);
      } catch (err) {
        console.error('Error cargando eventos:', err);
      }
    };

    loadEvents();
  }, []);

  return (
    <div style={{ height: '80vh', padding: 20 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        style={{ height: '100%' }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: '#ff6b6b', // rojo: ocupado
            color: 'white',
            borderRadius: '5px',
          },
        })}
        onSelectEvent={(event) => navigate(`/events/${event.id}`)}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay eventos en este rango",
        }}
      />
    </div>
  );
};

export default AgendaCalendar;

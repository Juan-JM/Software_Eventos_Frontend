// frontend/src/services/event.service.js
import api from './api';

export const getAllEvents = () => {
  return api.get('events/');
};

export const getEventById = (id) => {
  return api.get(`events/${id}/`);
};

export const createEvent = (eventData) => {
  return api.post('events/', eventData);
};

export const updateEvent = (id, eventData) => {
  return api.put(`events/${id}/`, eventData);
};

export const deleteEvent = (id) => {
  return api.delete(`events/${id}/`);
};

// Funciones auxiliares para filtrar eventos (si las necesitas en el frontend)
export const getEventsByStatus = (events, status) => {
  return events.filter(event => event.status === status);
};

export const getUpcomingEvents = (events) => {
  const now = new Date();
  return events.filter(event => new Date(event.start_date) > now);
};

export const searchEvents = (events, query) => {
  const searchTerm = query.toLowerCase();
  return events.filter(event => 
    event.name.toLowerCase().includes(searchTerm) ||
    event.description.toLowerCase().includes(searchTerm)
  );
};
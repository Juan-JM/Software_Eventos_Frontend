// frontend/src/services/schedules.service.js
import api from './api';

// Servicios para Cronogramas
export const getAllSchedules = () => {
  return api.get('schedules/');
};

export const getScheduleById = (id) => {
  return api.get(`schedules/${id}/`);
};

export const createSchedule = (scheduleData) => {
  return api.post('schedules/', scheduleData);
};

export const updateSchedule = (id, scheduleData) => {
  return api.put(`schedules/${id}/`, scheduleData);
};

export const deleteSchedule = (id) => {
  return api.delete(`schedules/${id}/`);
};

export const getScheduleActivities = (scheduleId) => {
  return api.get(`schedules/${scheduleId}/activities/`);
};

export const addActivityToSchedule = (scheduleId, activityData) => {
  return api.post(`schedules/${scheduleId}/add_activity/`, activityData);
};

// Servicios para Actividades
export const getAllActivities = () => {
  return api.get('schedules/activities/');
};

export const getActivityById = (id) => {
  return api.get(`schedules/activities/${id}/`);
};

export const createActivity = (activityData) => {
  return api.post('schedules/activities/', activityData);
};

export const updateActivity = (id, activityData) => {
  return api.put(`schedules/activities/${id}/`, activityData);
};

export const deleteActivity = (id) => {
  return api.delete(`schedules/activities/${id}/`);
};

export const updateActivityStatus = (id, status) => {
  return api.patch(`schedules/activities/${id}/update_status/`, { status });
};

// Funciones auxiliares
export const getSchedulesByEvent = (schedules, eventId) => {
  return schedules.filter(schedule => schedule.event && schedule.event.id === eventId);
};

export const getActivitiesByStatus = (activities, status) => {
  return activities.filter(activity => activity.status === status);
};

export const searchSchedules = (schedules, query) => {
  const searchTerm = query.toLowerCase();
  return schedules.filter(schedule => 
    schedule.event_name.toLowerCase().includes(searchTerm) ||
    (schedule.event_location && schedule.event_location.toLowerCase().includes(searchTerm))
  );
};

export const searchActivities = (activities, query) => {
  const searchTerm = query.toLowerCase();
  return activities.filter(activity => 
    activity.title.toLowerCase().includes(searchTerm) ||
    activity.description.toLowerCase().includes(searchTerm)
  );
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDuration = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }
};
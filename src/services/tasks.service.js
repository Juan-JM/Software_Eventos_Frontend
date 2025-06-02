// frontend/src/services/tasks.service.js
import api from './api';

export const getAllTasks = () => {
  return api.get('tasks/');
};

export const getTaskById = (id) => {
  return api.get(`tasks/${id}/`);
};

export const createTask = (taskData) => {
  return api.post('tasks/', taskData);
};

export const updateTask = (id, taskData) => {
  return api.put(`tasks/${id}/`, taskData);
};

export const deleteTask = (id) => {
  return api.delete(`tasks/${id}/`);
};

export const getTasksByStatus = (status) => {
  return api.get(`tasks/by_status/?status=${status}`);
};

export const getTasksByEvent = (eventId) => {
  return api.get(`tasks/by_event/?event_id=${eventId}`);
};

export const getPendingTasks = () => {
  return api.get('tasks/pending/');
};

export const getUpcomingTasks = () => {
  return api.get('tasks/upcoming/');
};

export const getMyTasks = () => {
  return api.get('tasks/my_tasks/');
};

export const updateTaskStatus = (id, status) => {
  return api.patch(`tasks/${id}/update_status/`, { status });
};

export const searchTasks = (query) => {
  return api.get(`tasks/search/?q=${query}`);
};
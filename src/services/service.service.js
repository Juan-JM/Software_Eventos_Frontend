//src/services/service.service.js
import api from './api';

export const getAllServices = () => {
  return api.get('services/');
};

export const getServiceById = (id) => {
  return api.get(`services/${id}/`);
};

export const createService = (serviceData) => {
  return api.post('services/', serviceData);
};

export const updateService = (id, serviceData) => {
  return api.put(`services/${id}/`, serviceData);
};

export const deleteService = (id) => {
  return api.delete(`services/${id}/`);
};
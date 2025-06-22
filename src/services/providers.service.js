// frontend/src/services/providers.service.js
import api from './api';

const BASE_URL = '/providers/';

export const getAllProviders = () => {
  return api.get(BASE_URL);
};

export const getProviderById = (id) => {
  return api.get(`${BASE_URL}${id}/`);
};

export const createProvider = (providerData) => {
  return api.post(BASE_URL, providerData);
};

export const updateProvider = (id, providerData) => {
  return api.put(`${BASE_URL}${id}/`, providerData);
};

export const deleteProvider = (id) => {
  return api.delete(`${BASE_URL}${id}/`);
};

export const searchProviders = (query) => {
  return api.get(`${BASE_URL}search/?q=${encodeURIComponent(query)}`);
};

export const getActiveProviders = () => {
  return api.get(`${BASE_URL}active/`);
};
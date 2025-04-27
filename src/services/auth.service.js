// frontend/src/services/auth.service.js
import api from './api';
import { jwtDecode } from 'jwt-decode'; // Cambiado de import jwt_decode from 'jwt-decode'

export const login = async (username, password) => {
  try {
    const response = await api.post('token/', { username, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      return jwtDecode(response.data.access); // Cambiado de jwt_decode
    }
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const register = async (userData) => {
  try {
    const response = await api.post('users/', userData);
    return response.data;
  } catch (error) {
    console.error("Error en el registro:", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    return jwtDecode(token); // Cambiado de jwt_decode
  }
  return null;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  try {
    const decodedToken = jwtDecode(token); // Cambiado de jwt_decode
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};
// frontend/src/services/axios-interceptor.js
import axios from 'axios';
import { getCurrentUser } from './auth.service';

// Función para configurar los interceptores de Axios
export const setupAxiosInterceptors = (navigate) => {
  // Interceptor de respuesta para manejar errores
  axios.interceptors.response.use(
    response => response,
    error => {
      // Si el error es un 403 y contiene subscription_required en la respuesta
      if (error.response && 
          error.response.status === 403 && 
          error.response.data && 
          error.response.data.subscription_required) {
        
        const user = getCurrentUser();
        // Solo redirigir si es admin o staff (los que requieren suscripción)
        if (user && (user.user_type === 'admin' || user.user_type === 'staff')) {
          navigate('/subscription/required');
          return new Promise(() => {}); // Detener la propagación del error
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Función para desconfigurar los interceptores al cerrar sesión
export const clearAxiosInterceptors = () => {
  axios.interceptors.response.eject(axios.interceptors.response.handlers[0]);
};
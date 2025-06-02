// frontend/src/services/staff.service.js
import api from './api';

export const getAllStaff = () => {
  return api.get('staff/');
};

export const getStaffById = (id) => {
  return api.get(`staff/${id}/`);
};

export const createStaff = (staffData) => {
  const formData = new FormData();
  
  // Agregar todos los campos al FormData
  Object.keys(staffData).forEach(key => {
    if (staffData[key] !== null && staffData[key] !== undefined) {
      if (key === 'photo' && staffData[key] instanceof File) {
        formData.append(key, staffData[key]);
      } else {
        formData.append(key, staffData[key]);
      }
    }
  });

  return api.post('staff/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateStaff = (id, staffData) => {
  const formData = new FormData();
  
  // Agregar todos los campos al FormData
  Object.keys(staffData).forEach(key => {
    if (staffData[key] !== null && staffData[key] !== undefined) {
      if (key === 'photo' && staffData[key] instanceof File) {
        formData.append(key, staffData[key]);
      } else {
        formData.append(key, staffData[key]);
      }
    }
  });

  return api.put(`staff/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteStaff = (id) => {
  return api.delete(`staff/${id}/`);
};

export const searchStaff = (query) => {
  return api.get(`staff/search/?q=${query}`);
};

export const getStaffByPosition = (position) => {
  return api.get(`staff/by_position/?position=${position}`);
};

export const getActiveStaff = () => {
  return api.get('staff/active/');
};
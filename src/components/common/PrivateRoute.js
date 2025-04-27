// frontend/src/components/common/PrivateRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { currentUser } = useAuth();
  console.log("PrivateRoute - currentUser:", currentUser);
  console.log("PrivateRoute - allowedRoles:", allowedRoles);

  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Si se especifican roles permitidos y el usuario no tiene el rol adecuado
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.user_type)) {
    console.log("Usuario no autorizado para esta ruta");
    return <Navigate to="/unauthorized" />;
  }
  
  // El usuario está autenticado y tiene los permisos adecuados
  return <Outlet />;
};

export default PrivateRoute;
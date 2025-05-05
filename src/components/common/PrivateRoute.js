import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { currentUser } = useAuth();

  console.log("PrivateRoute - currentUser:", currentUser);
  console.log("PrivateRoute - allowedRoles:", allowedRoles);

  // Si el usuario no está autenticado
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Validar que el user_type esté definido correctamente
  const userType = currentUser?.user_type?.toLowerCase();

  // Si hay roles definidos y el del usuario no está permitido
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    console.warn(`Acceso denegado para tipo de usuario: ${userType}`);
    return <Navigate to="/unauthorized" />;
  }

  // Acceso permitido
  return <Outlet />;
};

export default PrivateRoute;

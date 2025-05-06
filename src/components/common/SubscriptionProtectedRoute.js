// frontend/src/components/common/SubscriptionProtectedRoute.js
// import React, { useEffect } from 'react';
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

/**
 * Protege rutas que requieren una suscripción activa.
 * Los superadmin siempre tienen acceso.
 * Los admin y staff necesitan una suscripción activa.
 */
const SubscriptionProtectedRoute = () => {
  const { currentUser } = useAuth();
  const { subscription, loading } = useSubscription();
  const location = useLocation();

  // Si está cargando, no hacer nada todavía
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si el usuario no está autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superadmin siempre tiene acceso
  if (currentUser.user_type === 'superadmin') {
    return <Outlet />;
  }

  // Si no es admin ni staff, no tiene acceso
  if (currentUser.user_type !== 'admin' && currentUser.user_type !== 'staff') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si no hay suscripción activa, redirigir a la página de suscripción
  if (!subscription?.active) {
    return <Navigate to="/subscription" state={{ from: location }} replace />;
  }

  // Todo correcto, permitir acceso
  return <Outlet />;
};

export default SubscriptionProtectedRoute;
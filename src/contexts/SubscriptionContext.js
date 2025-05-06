// frontend/src/contexts/SubscriptionContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSubscription } from '../services/subscription.service';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      // Solo cargar la suscripción si hay un usuario autenticado y es admin o staff
      if (currentUser && (
          currentUser.user_type === 'superadmin' || 
          currentUser.user_type === 'admin' || 
          currentUser.user_type === 'staff'
        )) {
        try {
          const data = await getCurrentSubscription();
          setSubscription(data);
        } catch (err) {
          console.error('Error al cargar la suscripción:', err);
          setError('No se pudo cargar la información de suscripción');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [currentUser]);

  const refreshSubscription = async () => {
    setLoading(true);
    try {
      const data = await getCurrentSubscription();
      setSubscription(data);
    } catch (err) {
      setError('No se pudo actualizar la información de suscripción');
    } finally {
      setLoading(false);
    }
  };

  // Comprobar si el usuario tiene acceso a las funcionalidades premium
  const hasSubscriptionAccess = () => {
    // Si es superadmin siempre tiene acceso
    if (currentUser?.user_type === 'superadmin') return true;
    
    // Si no hay suscripción o no está activa, no tiene acceso
    return subscription?.active === true;
  };

  // Redirigir a la página de suscripción si no tiene acceso
  const requireSubscription = () => {
    if (!hasSubscriptionAccess() && currentUser?.user_type !== 'superadmin') {
      navigate('/subscription');
      return false;
    }
    return true;
  };

  const value = {
    subscription,
    loading,
    error,
    refreshSubscription,
    hasSubscriptionAccess,
    requireSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  return useContext(SubscriptionContext);
};
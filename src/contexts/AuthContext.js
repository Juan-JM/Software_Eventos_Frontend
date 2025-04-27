// frontend/src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      if (isAuthenticated()) {
        const user = getCurrentUser();
        console.log("AuthContext - User loaded:", user);
        setCurrentUser(user);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
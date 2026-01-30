import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário do backend
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Verificar se o usuário está autenticado
        const isAuth = await apiService.isAuthenticated();
        
        if (isAuth) {
          // Buscar dados do usuário logado do backend
          const userData = await apiService.getMe();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Método para definir usuário após login bem-sucedido
  const setUserFromLogin = (userData) => {
    setUser(userData);
  };

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  const updateProfileImage = (imageUrl) => {
    setUser(prev => ({ ...prev, fotoPerfil: imageUrl }));
  };

  const clearUser = () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    updateUser,
    updateProfileImage,
    clearUser,
    setUserFromLogin
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 
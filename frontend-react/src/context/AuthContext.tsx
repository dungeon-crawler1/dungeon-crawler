// =============================================================================
// CONTEXTO DE AUTENTICACIÓN Y ESTADO DE SESIÓN DE LA APLICACIÓN
// =============================================================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import { fetchUserProfile } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await fetchUserProfile();
          if (res.data?.user) {
            setUser(res.data.user);
          }
        } catch {
          // Si el token es inválido o expiró, limpiar el almacenamiento local
          localStorage.removeItem('jwt_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
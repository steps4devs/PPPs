/**
 * Context de Autenticación.
 * 
 * Proporciona el estado de autenticación y funciones para login/logout
 * a todos los componentes de la aplicación.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/auth.service';
import type { LoginRequest, LoginResponse, UserRole } from '../types';

// ============================================================================
// TIPOS
// ============================================================================

interface AuthContextType {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al montar el componente, verificar si ya hay una sesión activa
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verifica si existe una sesión activa en localStorage.
   */
  const checkAuth = () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = authService.getUserData();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Realiza el login del usuario.
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
    } catch (error) {
      // Propagar el error para que lo maneje el componente
      throw error;
    }
  };

  /**
   * Cierra la sesión del usuario.
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  /**
   * Verifica si el usuario tiene un rol específico.
   */
  const hasRole = (role: UserRole): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some(r => r === role || r.includes(role.replace('ROLE_', '')));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para usar el contexto de autenticación.
 * 
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}

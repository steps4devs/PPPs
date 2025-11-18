/**
 * Servicio de Autenticación.
 * 
 * Maneja el login, logout y gestión del JWT token.
 */

import apiClient, { getErrorMessage } from '../utils/apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/api.config';
import type { LoginRequest, LoginResponse, JwtPayload } from '../types';

// ============================================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================================

class AuthService {
  /**
   * Realiza el login del usuario.
   * 
   * @param credentials Username y password
   * @returns Datos del usuario autenticado
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const data = response.data;

      // Guardar token en localStorage
      this.saveToken(data.token);

      // Guardar datos del usuario
      this.saveUserData(data);

      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Cierra la sesión del usuario.
   */
  async logout(): Promise<void> {
    try {
      // Llamar endpoint de logout en el backend (opcional pero recomendado)
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Ignorar errores del backend, siempre limpiar localStorage
      console.error('Error al hacer logout en el servidor:', error);
    } finally {
      // Limpiar localStorage siempre
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  /**
   * Verifica si el usuario está autenticado.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar si el token ha expirado
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el token del localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  }

  /**
   * Guarda el token en localStorage.
   */
  private saveToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
  }

  /**
   * Guarda los datos del usuario en localStorage.
   */
  private saveUserData(userData: LoginResponse): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  /**
   * Obtiene los datos del usuario del localStorage.
   */
  getUserData(): LoginResponse | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Decodifica el JWT token (sin verificar firma).
   * Solo para leer el payload en el cliente.
   */
  private decodeToken(token: string): JwtPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Obtiene el userId del token JWT.
   * 
   * IMPORTANTE: Este es usuarios.id, NO profileId.
   */
  getUserId(): number | null {
    const userData = this.getUserData();
    return userData?.id || null;
  }

  /**
   * Obtiene el rol del usuario.
   */
  getUserRole(): string | null {
    const userData = this.getUserData();
    return userData?.roles?.[0] || null;
  }
}

// Exportar instancia única (Singleton)
export default new AuthService();

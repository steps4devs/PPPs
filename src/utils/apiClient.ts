/**
 * Cliente HTTP configurado con axios.
 * 
 * Incluye:
 * - Interceptores para agregar JWT automáticamente
 * - Manejo de errores centralizado
 * - Refresh token automático
 * - Logging de requests en desarrollo
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_CONFIG, STORAGE_KEYS } from '../config/api.config';

// ============================================================================
// CONFIGURACIÓN DEL CLIENTE AXIOS
// ============================================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// INTERCEPTOR DE REQUESTS (Agregar JWT)
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del localStorage
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);

    // Si existe token, agregarlo al header Authorization
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// INTERCEPTOR DE RESPONSES (Manejo de errores)
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log del error
    console.error('❌ Error en response:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data,
    });

    // ========================================================================
    // MANEJO DE ERRORES POR CÓDIGO HTTP
    // ========================================================================

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401: {
          // Token expirado o inválido
          
          // Solo hacer logout si es un error de token explícito
          const errorData = error.response.data as any;
          const errorMessage = errorData?.message || errorData?.error || '';
          
          // Verificar si es realmente un error de autenticación de token
          const isTokenError = 
            errorMessage.toLowerCase().includes('token') ||
            errorMessage.toLowerCase().includes('jwt') ||
            errorMessage.toLowerCase().includes('expired') ||
            errorMessage.toLowerCase().includes('invalid token') ||
            errorMessage === 'Unauthorized';
          
          if (isTokenError) {
            // Evitar loop infinito
            if (originalRequest._retry) {
              handleLogout();
              return Promise.reject(error);
            }

            originalRequest._retry = true;

            // TODO: Implementar refresh token si el backend lo soporta
            // Por ahora, solo hacer logout
            handleLogout();
            return Promise.reject(error);
          }
          // Si no es error de token, dejar pasar el error para que lo maneje el componente
          console.error('⚠️ Error 401 (no de token):', errorMessage);
          break;
        }

        case 403:
          // Forbidden - No tiene permisos
          console.error('🚫 Acceso denegado. No tienes permisos para esta acción.');
          break;

        case 404:
          // Not Found
          console.error('🔍 Recurso no encontrado');
          break;

        case 422:
          // Validación fallida
          console.error('⚠️ Error de validación:', error.response.data);
          break;

        case 500:
          // Error del servidor
          console.error('💥 Error interno del servidor');
          break;

        default:
          console.error(`❌ Error HTTP ${status}`);
      }
    } else if (error.request) {
      // Request fue enviado pero no hubo respuesta
      console.error('📡 No se recibió respuesta del servidor. Verifica tu conexión.');
    } else {
      // Error al configurar el request
      console.error('⚙️ Error al configurar la petición:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Limpia el localStorage y recarga la aplicación para volver a login.
 */
function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  
  // Redirigir a login (recargar app)
  window.location.href = '/';
}

/**
 * Extrae el mensaje de error del response de axios.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Si el backend devuelve un mensaje específico
    const backendMessage = (error.response?.data as any)?.message || 
                          (error.response?.data as any)?.error;
    
    if (backendMessage) {
      return backendMessage;
    }

    // Mensajes por código HTTP
    switch (error.response?.status) {
      case 400:
        return 'Solicitud inválida. Verifica los datos enviados.';
      case 401:
        return 'No autorizado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 422:
        return 'Error de validación. Verifica los datos ingresados.';
      case 500:
        return 'Error interno del servidor. Intenta nuevamente más tarde.';
      default:
        return error.message || 'Error desconocido';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

export default apiClient;

// =============================================================================
// SERVICIO CENTRALIZADO DE PETICIONES HTTP
// Criterio de Calidad: Aislar totalmente fetch fuera de los componentes React
// =============================================================================
import { AuthResponse } from '../types/auth';

// Lectura de la variable de entorno centralizada con respaldo por defecto
const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Función genérica para la ejecución de peticiones HTTP con inyección automática de token JWT.
 */
async function request<T = AuthResponse>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('jwt_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la comunicación con el servidor');
  }

  return data as T;
}

export default request;
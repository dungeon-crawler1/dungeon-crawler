import { AuthResponse } from '../types/auth';

const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Petición genérica con inyección de JWT. Aísla fetch fuera de los componentes Vue.
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
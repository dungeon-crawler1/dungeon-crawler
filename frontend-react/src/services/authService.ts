// =============================================================================
// SERVICIO DE AUTENTICACIÓN (LOGIN, REGISTRO Y PERFIL)
// =============================================================================
import request from './apiService';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

/**
 * Enviar credenciales de acceso al backend.
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * Registrar un nuevo usuario en la base de datos.
 */
export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * Validar la sesión y consultar la información del perfil autenticado.
 */
export async function fetchUserProfile(): Promise<AuthResponse> {
  return request<AuthResponse>('/users/profile', {
    method: 'GET',
  });
}
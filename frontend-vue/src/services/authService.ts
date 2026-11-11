import request from './apiService';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function fetchUserProfile(): Promise<AuthResponse> {
  return request<AuthResponse>('/users/profile', {
    method: 'GET',
  });
}
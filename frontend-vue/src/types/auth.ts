// =============================================================================
// TIPOS DE DATOS DE AUTENTICACIÓN (Vue 3 - Tipado Estricto, 0 any)
// =============================================================================

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  status: string;
  message?: string;
  data?: {
    user: User;
    token: string;
  };
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}
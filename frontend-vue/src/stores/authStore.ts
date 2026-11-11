// =============================================================================
// STORE GLOBAL DE SESIÓN CON PINIA (ESTADO DE AUTENTICACIÓN)
// =============================================================================
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User } from '../types/auth';
import { fetchUserProfile } from '../services/authService';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('jwt_token'));
  const user = ref<User | null>(null);
  const loading = ref<boolean>(true);

  const isAuthenticated = computed(() => !!token.value);

  /**
   * Verificar la validez de la sesión activa al recargar la aplicación.
   */
  async function verifySession(): Promise<void> {
    if (token.value) {
      try {
        const res = await fetchUserProfile();
        if (res.data?.user) {
          user.value = res.data.user;
        }
      } catch {
        logout();
      }
    }
    loading.value = false;
  }

  /**
   * Guardar token e información de usuario tras inicio de sesión exitoso.
   */
  function setAuthData(newToken: string, newUser: User): void {
    localStorage.setItem('jwt_token', newToken);
    token.value = newToken;
    user.value = newUser;
  }

  /**
   * Limpiar credenciales y cerrar sesión.
   */
  function logout(): void {
    localStorage.removeItem('jwt_token');
    token.value = null;
    user.value = null;
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    verifySession,
    setAuthData,
    logout,
  };
});
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '../authStore';

const mocks = vi.hoisted(() => ({ fetchUserProfile: vi.fn() }));
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};

vi.mock('../../services/authService', () => ({
  fetchUserProfile: mocks.fetchUserProfile,
}));

describe('authStore', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    storage.clear();
    setActivePinia(createPinia());
    mocks.fetchUserProfile.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('inicializa el token desde localStorage', () => {
    localStorage.setItem('jwt_token', 'token-persistido');

    const store = useAuthStore();

    expect(store.token).toBe('token-persistido');
    expect(store.isAuthenticated).toBe(true);
    expect(store.loading).toBe(true);
  });

  it('inicia sin token cuando localStorage está vacío', () => {
    const store = useAuthStore();

    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('setAuthData guarda el token y el usuario en el store y en localStorage', () => {
    const store = useAuthStore();

    store.setAuthData('jwt-123', { id: 4, email: 'lina@test.com' });

    expect(store.token).toBe('jwt-123');
    expect(store.user).toEqual({ id: 4, email: 'lina@test.com' });
    expect(store.isAuthenticated).toBe(true);
    expect(localStorage.getItem('jwt_token')).toBe('jwt-123');
  });

  it('logout limpia el estado y las credenciales persistidas', () => {
    const store = useAuthStore();
    store.setAuthData('jwt-123', { id: 4, email: 'lina@test.com' });

    store.logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('verifySession carga el usuario y desactiva loading', async () => {
    localStorage.setItem('jwt_token', 'jwt-123');
    mocks.fetchUserProfile.mockResolvedValue({
      status: 'ok',
      data: { user: { id: 9, email: 'sara@test.com' }, token: 'jwt-123' },
    });
    const store = useAuthStore();

    await store.verifySession();

    expect(mocks.fetchUserProfile).toHaveBeenCalledTimes(1);
    expect(store.user).toEqual({ id: 9, email: 'sara@test.com' });
    expect(store.loading).toBe(false);
  });

  it('verifySession desactiva loading sin consultar el perfil si no hay token', async () => {
    const store = useAuthStore();

    await store.verifySession();

    expect(mocks.fetchUserProfile).not.toHaveBeenCalled();
    expect(store.loading).toBe(false);
    expect(store.user).toBeNull();
  });

  it('verifySession mantiene user en null si la respuesta no trae usuario', async () => {
    localStorage.setItem('jwt_token', 'jwt-123');
    mocks.fetchUserProfile.mockResolvedValue({ status: 'ok' });
    const store = useAuthStore();

    await store.verifySession();

    expect(store.user).toBeNull();
    expect(store.loading).toBe(false);
  });

  it('verifySession cierra la sesión cuando el perfil falla', async () => {
    localStorage.setItem('jwt_token', 'jwt-123');
    mocks.fetchUserProfile.mockRejectedValue(new Error('Token expirado'));
    const store = useAuthStore();

    await store.verifySession();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(store.loading).toBe(false);
  });
});

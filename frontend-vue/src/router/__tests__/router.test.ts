import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetchUserProfile: vi.fn() }));

vi.mock('../../services/authService', () => ({
  fetchUserProfile: mocks.fetchUserProfile,
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

async function setup() {
  vi.resetModules();
  const { createPinia, setActivePinia } = await import('pinia');
  setActivePinia(createPinia());
  const { default: router } = await import('../index');
  const { useAuthStore } = await import('../../stores/authStore');
  return { router, useAuthStore };
}

describe('router', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.fetchUserProfile.mockReset();
  });

  it('define las rutas públicas y la ruta protegida', async () => {
    const { router } = await setup();

    expect(router.getRoutes().map((route) => route.name)).toEqual(
      expect.arrayContaining(['Login', 'Register', 'Dashboard']),
    );
  });

  it('permite el acceso al dashboard con una sesión válida', async () => {
    localStorage.setItem('jwt_token', 'jwt-123');
    mocks.fetchUserProfile.mockResolvedValue({
      status: 'ok',
      data: { user: { id: 3, email: 'lina@test.com' }, token: 'jwt-123' },
    });
    const { router, useAuthStore } = await setup();

    await router.push('/dashboard');

    expect(router.currentRoute.value.name).toBe('Dashboard');
    expect(useAuthStore().user?.email).toBe('lina@test.com');
    expect(useAuthStore().loading).toBe(false);
  });

  it('redirige al login cuando la ruta protegida no tiene sesión', async () => {
    const { router } = await setup();

    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/login');
    expect(mocks.fetchUserProfile).not.toHaveBeenCalled();
  });

  it('redirige al login cuando la verificación de sesión falla', async () => {
    localStorage.setItem('jwt_token', 'expirado');
    mocks.fetchUserProfile.mockRejectedValue(new Error('Token expirado'));
    const { router, useAuthStore } = await setup();

    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/login');
    expect(useAuthStore().token).toBeNull();
  });

  it('permite navegar entre rutas públicas', async () => {
    const { router } = await setup();

    await router.push('/register');
    await router.push('/login');

    expect(router.currentRoute.value.name).toBe('Login');
  });

  it('redirige rutas desconocidas al dashboard', async () => {
    localStorage.setItem('jwt_token', 'jwt-123');
    mocks.fetchUserProfile.mockResolvedValue({
      status: 'ok',
      data: { user: { id: 3, email: 'lina@test.com' }, token: 'jwt-123' },
    });
    const { router } = await setup();

    await router.push('/ruta-inexistente');

    expect(router.currentRoute.value.name).toBe('Dashboard');
  });

  it('no revalida la sesión una vez finalizada la carga inicial', async () => {
    localStorage.setItem('jwt_token', 'jwt-123');
    mocks.fetchUserProfile.mockResolvedValue({ status: 'ok' });
    const { router } = await setup();

    await router.push('/dashboard');
    await router.push('/login');
    await router.push('/register');

    expect(router.currentRoute.value.name).toBe('Register');
    expect(mocks.fetchUserProfile).toHaveBeenCalledTimes(1);
  });
});

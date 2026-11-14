import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loginUser, registerUser, fetchUserProfile } from '../authService';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('../apiService', () => ({ default: mocks.request }));

describe('authService', () => {
  beforeEach(() => {
    mocks.request.mockReset();
    mocks.request.mockResolvedValue({ status: 'ok' });
  });

  it('loginUser envía las credenciales por POST a /auth/login', async () => {
    const credentials = { email: 'lina@test.com', password: 'secreta' };

    const response = await loginUser(credentials);

    expect(mocks.request).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    expect(response).toEqual({ status: 'ok' });
  });

  it('registerUser envía las credenciales por POST a /auth/register', async () => {
    const credentials = { email: 'nuevo@test.com', password: 'clave123' };

    await registerUser(credentials);

    expect(mocks.request).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  });

  it('fetchUserProfile consulta el perfil mediante GET', async () => {
    await fetchUserProfile();

    expect(mocks.request).toHaveBeenCalledWith('/users/profile', { method: 'GET' });
  });
});

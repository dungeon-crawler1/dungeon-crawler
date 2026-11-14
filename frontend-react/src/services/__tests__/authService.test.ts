import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from '../apiService';
import { fetchUserProfile, loginUser, registerUser } from '../authService';

vi.mock('../apiService', () => ({ default: vi.fn() }));

const requestMock = vi.mocked(request);

describe('authService', () => {
  beforeEach(() => {
    requestMock.mockReset();
    requestMock.mockResolvedValue({ status: 'ok' });
  });

  it('envía las credenciales al endpoint de login', async () => {
    await loginUser({ email: 'a@test.com', password: 'secreta' });

    expect(requestMock).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@test.com', password: 'secreta' }),
    });
  });

  it('envía las credenciales al endpoint de registro', async () => {
    await registerUser({ email: 'nuevo@test.com', password: 'clave' });

    expect(requestMock).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'nuevo@test.com', password: 'clave' }),
    });
  });

  it('consulta el perfil del usuario autenticado', async () => {
    await fetchUserProfile();

    expect(requestMock).toHaveBeenCalledWith('/users/profile', { method: 'GET' });
  });
});

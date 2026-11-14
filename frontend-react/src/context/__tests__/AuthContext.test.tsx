import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../AuthContext';
import { fetchUserProfile } from '../../services/authService';

vi.mock('../../services/authService', () => ({ fetchUserProfile: vi.fn() }));

const fetchProfileMock = vi.mocked(fetchUserProfile);
const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;
const user = { id: 1, email: 'hero@test.com' };

describe('AuthContext', () => {
  beforeEach(() => {
    fetchProfileMock.mockReset();
    fetchProfileMock.mockResolvedValue({ status: 'ok', data: { user, token: 'token-ok' } });
  });

  it('finaliza la carga sin usuario cuando no hay token guardado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(fetchProfileMock).not.toHaveBeenCalled();
  });

  it('recupera el perfil cuando el token es válido', async () => {
    localStorage.setItem('jwt_token', 'token-ok');
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(user);
    expect(result.current.token).toBe('token-ok');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('limpia la sesión cuando el perfil no puede validarse', async () => {
    localStorage.setItem('jwt_token', 'token-invalido');
    fetchProfileMock.mockRejectedValue(new Error('401'));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('guarda y elimina la sesión con login y logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.login('nuevo-token', user);
      await Promise.resolve();
    });
    expect(localStorage.getItem('jwt_token')).toBe('nuevo-token');
    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      result.current.logout();
      await Promise.resolve();
    });    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('lanza un error si useAuth se usa fuera del proveedor', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useAuth())).toThrow('useAuth debe ser utilizado dentro de un AuthProvider');
  });
});

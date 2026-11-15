import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { fetchUserProfile } from '../services/authService';

vi.mock('../services/authService', () => ({
  fetchUserProfile: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

const fetchProfileMock = vi.mocked(fetchUserProfile);

function renderAt(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('App', () => {
  beforeEach(() => {
    fetchProfileMock.mockReset();
    fetchProfileMock.mockResolvedValue({ status: 'ok', data: { user: { id: 1, email: 'a@test.com' }, token: 't' } });
  });

  it('renderiza la ruta pública de login', () => {
    renderAt('/login');

    expect(screen.getByText('⚔ Entrada a la Mazmorra')).toBeTruthy();
  });

  it('renderiza la ruta pública de registro', () => {
    renderAt('/register');

    expect(screen.getByText('⚔ Forjar un Nuevo Héroe')).toBeTruthy();
  });

  it('redirige al login si no hay token en una ruta protegida', () => {
    renderAt('/dashboard');

    expect(screen.getByText('⚔ Entrada a la Mazmorra')).toBeTruthy();
  });

  it('redirige rutas desconocidas al login cuando no hay sesión', () => {
    renderAt('/ruta-inexistente');

    expect(screen.getByText('⚔ Entrada a la Mazmorra')).toBeTruthy();
  });

  it('permite acceder al panel cuando existe un token', async () => {
    localStorage.setItem('jwt_token', 'token');
    renderAt('/dashboard');

    expect(await screen.findByText('⚔ Panel del Aventurero')).toBeTruthy();
  });

  it('permite acceder a la mazmorra cuando existe un token', async () => {
    localStorage.setItem('jwt_token', 'token');
    renderAt('/game');

    expect(await screen.findByText('Selecciona tu Clase para Entrar a la Mazmorra')).toBeTruthy();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../services/authService', () => ({ loginUser: vi.fn() }));

const authMock = vi.mocked(useAuth);
const loginUserMock = vi.mocked(loginUser);
const loginMock = vi.fn();

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<div>Registro destino</div>} />
        <Route path="/dashboard" element={<div>Dashboard destino</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function submitForm(email = 'hero@test.com', password = 'secreta') {
  fireEvent.change(screen.getByLabelText('Correo Electrónico:'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Contraseña:'), { target: { value: password } });
  const form = screen.getByRole('button', { name: 'Ingresar' }).closest('form');
  fireEvent.submit(form as HTMLFormElement);
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
    loginUserMock.mockReset();
    authMock.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      login: loginMock,
      logout: vi.fn(),
    });
  });

  it('inicia sesión y navega al panel principal', async () => {
    const user = { id: 7, email: 'hero@test.com' };
    loginUserMock.mockResolvedValue({ status: 'ok', data: { token: 'jwt-1', user } });
    renderPage();

    submitForm();

    expect(await screen.findByText('Dashboard destino')).toBeTruthy();
    expect(loginUserMock).toHaveBeenCalledWith({ email: 'hero@test.com', password: 'secreta' });
    expect(loginMock).toHaveBeenCalledWith('jwt-1', user);
  });

  it('acepta el token y el usuario heredados de la respuesta', async () => {
    loginUserMock.mockResolvedValue({ status: 'ok', token: 'jwt-legacy' });
    renderPage();

    submitForm();

    expect(await screen.findByText('Dashboard destino')).toBeTruthy();
    expect(loginMock).toHaveBeenCalledWith('jwt-legacy', { id: 1, email: 'hero@test.com' });
  });

  it('muestra un error cuando el servidor no devuelve token', async () => {
    loginUserMock.mockResolvedValue({ status: 'ok' });
    renderPage();

    submitForm();

    expect(await screen.findByText('El servidor no retornó un token válido.')).toBeTruthy();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('muestra el mensaje de un error de autenticación', async () => {
    loginUserMock.mockRejectedValue(new Error('Credenciales inválidas'));
    renderPage();

    submitForm();

    expect(await screen.findByText('Credenciales inválidas')).toBeTruthy();
  });

  it('usa un mensaje genérico ante errores desconocidos', async () => {
    loginUserMock.mockRejectedValue('fallo de red');
    renderPage();

    submitForm();

    expect(await screen.findByText('Error al procesar el inicio de sesión')).toBeTruthy();
  });

  it('ofrece el enlace al registro', () => {
    renderPage();

    fireEvent.click(screen.getByRole('link', { name: 'Regístrate aquí' }));

    expect(screen.getByText('Registro destino')).toBeTruthy();
  });
});

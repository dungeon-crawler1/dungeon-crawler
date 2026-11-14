import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RegisterPage } from '../RegisterPage';
import { registerUser } from '../../services/authService';

vi.mock('../../services/authService', () => ({ registerUser: vi.fn() }));

const registerMock = vi.mocked(registerUser);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>Login destino</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function submitForm(email = 'nuevo@test.com', password = 'clave123') {
  fireEvent.change(screen.getByLabelText('Correo Electrónico:'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Contraseña:'), { target: { value: password } });
  const form = screen.getByRole('button', { name: 'Registrar' }).closest('form');
  fireEvent.submit(form as HTMLFormElement);
}

describe('RegisterPage', () => {
  beforeEach(() => {
    registerMock.mockReset();
  });

  it('registra la cuenta y redirige al login tras el aviso', async () => {
    vi.useFakeTimers();
    registerMock.mockResolvedValue({ status: 'ok' });
    renderPage();

    await act(async () => {
      submitForm();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(registerMock).toHaveBeenCalledWith({ email: 'nuevo@test.com', password: 'clave123' });
    expect(screen.getByText(/Registro completado con éxito/)).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('Login destino')).toBeTruthy();
  });

  it('muestra el mensaje de error del registro', async () => {
    registerMock.mockRejectedValue(new Error('La cuenta ya existe'));
    renderPage();

    submitForm();

    expect(await screen.findByText('La cuenta ya existe')).toBeTruthy();
  });

  it('usa un mensaje genérico ante errores desconocidos', async () => {
    registerMock.mockRejectedValue('fallo');
    renderPage();

    submitForm();

    expect(await screen.findByText('Error al registrar la cuenta')).toBeTruthy();
  });

  it('ofrece el enlace al inicio de sesión', () => {
    renderPage();

    fireEvent.click(screen.getByRole('link', { name: 'Inicia sesión' }));

    expect(screen.getByText('Login destino')).toBeTruthy();
  });
});

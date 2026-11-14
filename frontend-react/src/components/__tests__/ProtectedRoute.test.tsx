import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));

const useAuthMock = vi.mocked(useAuth);

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/private" element={<div>Contenido privado</div>} />
        </Route>
        <Route path="/login" element={<div>Pantalla de login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('muestra el estado de carga de la sesión', () => {
    useAuthMock.mockReturnValue({ loading: true, isAuthenticated: false } as ReturnType<typeof useAuth>);
    renderRoute();

    expect(screen.getByText('Cargando sesión...')).toBeTruthy();
  });

  it('redirige al login cuando no hay autenticación', () => {
    useAuthMock.mockReturnValue({ loading: false, isAuthenticated: false } as ReturnType<typeof useAuth>);
    renderRoute();

    expect(screen.getByText('Pantalla de login')).toBeTruthy();
  });

  it('renderiza la ruta hija cuando el usuario está autenticado', () => {
    useAuthMock.mockReturnValue({ loading: false, isAuthenticated: true } as ReturnType<typeof useAuth>);
    renderRoute();

    expect(screen.getByText('Contenido privado')).toBeTruthy();
  });
});

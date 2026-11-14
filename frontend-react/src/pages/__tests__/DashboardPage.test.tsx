import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/login" element={<div>Login destino</div>} />
        <Route path="/game" element={<div>Juego destino</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  it('muestra el panel principal', () => {
    renderPage();

    expect(screen.getByText('Panel Principal - Roguelike Game (React)')).toBeTruthy();
    expect(screen.getByText('Bienvenido al Calabozo')).toBeTruthy();
  });

  it('cierra la sesión eliminando el token', () => {
    localStorage.setItem('jwt_token', 'token');
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));

    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(screen.getByText('Login destino')).toBeTruthy();
  });

  it('navega a la mazmorra', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '⚔️ Entrar a la Mazmorra' }));

    expect(screen.getByText('Juego destino')).toBeTruthy();
  });
});

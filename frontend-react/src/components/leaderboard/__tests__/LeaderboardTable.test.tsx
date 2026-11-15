import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LeaderboardTable } from '../LeaderboardTable';
import type { LeaderboardEntry } from '../../../types/leaderboard';

const entries: LeaderboardEntry[] = [
  { id: 1, usuario: 'ana@test.com', clase: 'MAGO', puntuacion: 12, resultado: 'DERROTA', created_at: '2026-11-10T12:00:00Z' },
  { id: 2, clase: 'PICARO', puntuacion: 7, resultado: 'VICTORIA_RETIRO', created_at: '2026-11-11T12:00:00Z' },
];

function renderTable(overrides = {}) {
  const onSelect = vi.fn();
  render(<LeaderboardTable title="Top 10 Global" entries={entries} loading={false} error={null} onSelect={onSelect} {...overrides} />);
  return onSelect;
}

describe('LeaderboardTable', () => {
  it('lista las partidas y abre el detalle al hacer clic', () => {
    const onSelect = renderTable();

    expect(screen.getByText('ana@test.com')).toBeTruthy();
    expect(screen.getByText('Yo')).toBeTruthy();
    fireEvent.click(screen.getByText('ana@test.com'));

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('muestra el estado de carga', () => {
    renderTable({ entries: [], loading: true });
    expect(screen.getByText('Cargando puntuaciones...')).toBeTruthy();
  });

  it('muestra el error y el vacío', () => {
    renderTable({ entries: [], error: 'Sin conexión' });
    expect(screen.getByText('Sin conexión')).toBeTruthy();
  });

  it('muestra un mensaje cuando no hay partidas', () => {
    renderTable({ entries: [] });
    expect(screen.getByText('Todavía no hay partidas registradas.')).toBeTruthy();
  });
});

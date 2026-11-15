import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LeaderboardSection } from '../LeaderboardSection';
import { fetchGlobalLeaderboard, fetchUserLeaderboard } from '../../../services/leaderboardService';

vi.mock('../../../services/leaderboardService', () => ({
  fetchGlobalLeaderboard: vi.fn(),
  fetchUserLeaderboard: vi.fn(),
}));
vi.mock('../TimelineModal', () => ({
  TimelineModal: ({ runId }: { runId: number }) => <div>Detalle de partida {runId}</div>,
}));

const globalMock = vi.mocked(fetchGlobalLeaderboard);
const userMock = vi.mocked(fetchUserLeaderboard);

const globalRows = [{ id: 1, usuario: 'ana@test.com', clase: 'MAGO', puntuacion: 12, resultado: 'DERROTA', created_at: '2026-11-10T12:00:00Z' }];
const userRows = [{ id: 2, clase: 'PICARO', puntuacion: 7, resultado: 'VICTORIA_RETIRO', created_at: '2026-11-11T12:00:00Z' }];

describe('LeaderboardSection', () => {
  beforeEach(() => {
    globalMock.mockReset().mockResolvedValue({ status: 'ok', data: globalRows } as never);
    userMock.mockReset().mockResolvedValue({ status: 'ok', data: userRows } as never);
  });

  it('carga el top global y abre el detalle de una partida', async () => {
    render(<LeaderboardSection />);

    expect(await screen.findByText('ana@test.com')).toBeTruthy();
    fireEvent.click(screen.getByText('ana@test.com'));

    expect(screen.getByText('Detalle de partida 1')).toBeTruthy();
  });

  it('permite cambiar al top personal', async () => {
    render(<LeaderboardSection />);
    await screen.findByText('ana@test.com');

    fireEvent.click(screen.getByRole('button', { name: '👤 Mis Partidas' }));

    expect(await screen.findByText('Yo')).toBeTruthy();
  });

  it('muestra el error si falla la carga', async () => {
    globalMock.mockRejectedValue(new Error('Sin conexión'));
    render(<LeaderboardSection />);

    expect(await screen.findByText('Sin conexión')).toBeTruthy();
  });
});

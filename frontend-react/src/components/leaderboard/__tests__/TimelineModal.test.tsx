import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TimelineModal } from '../TimelineModal';
import { fetchRunTimeline } from '../../../services/leaderboardService';

vi.mock('../../../services/leaderboardService', () => ({ fetchRunTimeline: vi.fn() }));

const fetchMock = vi.mocked(fetchRunTimeline);

const run = {
  id: 5,
  clase: 'MAGO',
  puntuacion: 3,
  resultado: 'DERROTA',
  monedas_actuales: 20,
  created_at: '2026-11-10T12:00:00Z',
  estado_run: {
    monedas_finales: 20,
    dano_infligido: 120,
    dano_recibido: 40,
    enemigos_derrotados: 4,
    jefes_derrotados: ['Dragón Ancestral'],
    reliquias: ['Afilador'],
    historial_habitaciones: [
      { habitacion: 1, evento: 'COMBAT', resultado: 'SUPERADA', detalle: 'Venciste a Orco' },
      { habitacion: 2, evento: 'TREASURE', resultado: 'SUPERADA', detalle: 'Obtuviste 60 monedas' },
    ],
  },
};

describe('TimelineModal', () => {
  beforeEach(() => { fetchMock.mockReset(); });

  it('muestra estadísticas y habitaciones de la partida', async () => {
    fetchMock.mockResolvedValue({ status: 'ok', data: run } as never);
    render(<TimelineModal runId={5} onClose={vi.fn()} />);

    expect(await screen.findByText(/Sala #1/)).toBeTruthy();
    expect(screen.getByText(/Sala #2/)).toBeTruthy();
    expect(screen.getByText(/Daño infligido/).textContent).toContain('120');
    expect(screen.getByText(/Enemigos derrotados/).textContent).toContain('4');
    expect(screen.getByText(/Dragón Ancestral/)).toBeTruthy();
    expect(screen.getByText(/Afilador/)).toBeTruthy();
  });

  it('cierra el modal', async () => {
    fetchMock.mockResolvedValue({ status: 'ok', data: run } as never);
    const onClose = vi.fn();
    render(<TimelineModal runId={5} onClose={onClose} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('muestra el error cuando no se puede cargar', async () => {
    fetchMock.mockRejectedValue(new Error('Partida no encontrada'));
    render(<TimelineModal runId={5} onClose={vi.fn()} />);

    expect(await screen.findByText('Partida no encontrada')).toBeTruthy();
  });

  it('avisa cuando la partida no tiene estadísticas detalladas', async () => {
    fetchMock.mockResolvedValue({ status: 'ok', data: { ...run, estado_run: undefined } } as never);
    render(<TimelineModal runId={5} onClose={vi.fn()} />);

    expect(await screen.findByText(/no tiene estadísticas detalladas/)).toBeTruthy();
  });
});

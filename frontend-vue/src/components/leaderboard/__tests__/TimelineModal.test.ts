import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import TimelineModal from '../TimelineModal.vue';
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

  it('muestra estadísticas y habitaciones', async () => {
    fetchMock.mockResolvedValue({ status: 'ok', data: run } as never);
    const wrapper = mount(TimelineModal, { props: { runId: 5 } });
    await flushPromises();

    expect(wrapper.text()).toContain('Sala #1');
    expect(wrapper.text()).toContain('Sala #2');
    expect(wrapper.text()).toContain('Daño infligido: 120');
    expect(wrapper.text()).toContain('Enemigos derrotados: 4');
    expect(wrapper.text()).toContain('Dragón Ancestral');
  });

  it('emite close y muestra errores', async () => {
    fetchMock.mockRejectedValue(new Error('Partida no encontrada'));
    const wrapper = mount(TimelineModal, { props: { runId: 5 } });
    await flushPromises();
    expect(wrapper.text()).toContain('Partida no encontrada');
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import LeaderboardSection from '../LeaderboardSection.vue';
import { fetchGlobalLeaderboard, fetchUserLeaderboard } from '../../../services/leaderboardService';

vi.mock('../../../services/leaderboardService', () => ({
  fetchGlobalLeaderboard: vi.fn(),
  fetchUserLeaderboard: vi.fn(),
}));
vi.mock('../TimelineModal.vue', () => ({
  default: { props: ['runId'], template: '<div>Detalle {{ runId }}</div>' },
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

  it('carga el top global y abre el detalle', async () => {
    const wrapper = mount(LeaderboardSection);
    await flushPromises();

    expect(wrapper.text()).toContain('ana@test.com');
    await wrapper.findAll('tbody tr')[0].trigger('click');
    expect(wrapper.text()).toContain('Detalle 1');
  });

  it('cambia al top personal', async () => {
    const wrapper = mount(LeaderboardSection);
    await flushPromises();

    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.text()).toContain('Yo');
  });

  it('muestra el error si falla la carga', async () => {
    globalMock.mockRejectedValue(new Error('Sin conexión'));
    const wrapper = mount(LeaderboardSection);
    await flushPromises();
    expect(wrapper.text()).toContain('Sin conexión');
  });
});

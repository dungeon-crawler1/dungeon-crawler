import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import LeaderboardTable from '../LeaderboardTable.vue';

const entries = [
  { id: 1, usuario: 'ana@test.com', clase: 'MAGO', puntuacion: 12, resultado: 'DERROTA', created_at: '2026-11-10T12:00:00Z' },
  { id: 2, clase: 'PICARO', puntuacion: 7, resultado: 'VICTORIA_RETIRO', created_at: '2026-11-11T12:00:00Z' },
];

describe('LeaderboardTable', () => {
  it('lista partidas y emite el detalle', async () => {
    const wrapper = mount(LeaderboardTable, { props: { title: 'Top 10 Global', entries, loading: false, error: null } });
    expect(wrapper.text()).toContain('ana@test.com');
    expect(wrapper.text()).toContain('Yo');

    await wrapper.findAll('tbody tr')[0].trigger('click');
    expect(wrapper.emitted('select')?.[0]).toEqual([1]);
  });

  it('mantiene la tabla visible sin partidas', () => {
    const wrapper = mount(LeaderboardTable, { props: { title: 'Top 10 Global', entries: [], loading: false, error: null } });
    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.text()).toContain('Todavía no hay partidas registradas.');
  });

  it('muestra carga y error', () => {
    const loadingWrapper = mount(LeaderboardTable, { props: { title: 'Top', entries: [], loading: true, error: null } });
    expect(loadingWrapper.text()).toContain('Cargando puntuaciones');
    const errorWrapper = mount(LeaderboardTable, { props: { title: 'Top', entries: [], loading: false, error: 'Sin conexión' } });
    expect(errorWrapper.text()).toContain('Sin conexión');
  });
});

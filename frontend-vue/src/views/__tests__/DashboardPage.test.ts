import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DashboardPage from '../DashboardPage.vue';
import { useAuthStore } from '../../stores/authStore';

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('../../components/leaderboard/LeaderboardSection.vue', () => ({ default: { template: '<div>Leaderboard stub</div>' } }));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
  useRoute: () => ({ params: {} }),
}));

function mountPage() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return mount(DashboardPage, { global: { plugins: [pinia] } });
}

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.push.mockReset();
  });

  it('muestra Jugador cuando el store no tiene usuario', () => {
    const wrapper = mountPage();

    expect(wrapper.find('h2').text()).toContain('Bienvenido al Calabozo');
    expect(wrapper.text()).toContain('Usuario autenticado: Jugador');
  });

  it('muestra el email del usuario autenticado', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useAuthStore().setAuthData('jwt-123', { id: 2, email: 'sara@test.com' });

    const wrapper = mount(DashboardPage, { global: { plugins: [pinia] } });

    expect(wrapper.text()).toContain('sara@test.com');
  });

  it('navega al juego al pulsar Entrar a la Mazmorra', async () => {
    const wrapper = mountPage();

    await wrapper.find('.enter-game').trigger('click');

    expect(mocks.push).toHaveBeenCalledWith('/game');
  });

  it('cierra la sesión y navega al login al pulsar el botón', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useAuthStore();
    store.setAuthData('jwt-123', { id: 2, email: 'sara@test.com' });
    const wrapper = mount(DashboardPage, { global: { plugins: [pinia] } });

    await wrapper.find('button').trigger('click');

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(mocks.push).toHaveBeenCalledWith('/login');
  });
});

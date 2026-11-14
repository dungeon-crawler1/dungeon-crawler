import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LoginPage from '../LoginPage.vue';
import { useAuthStore } from '../../stores/authStore';

const mocks = vi.hoisted(() => ({ push: vi.fn(), loginUser: vi.fn() }));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
  useRoute: () => ({ params: {} }),
}));

vi.mock('../../services/authService', () => ({
  loginUser: mocks.loginUser,
  registerUser: vi.fn(),
  fetchUserProfile: vi.fn(),
}));

function mountPage() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return mount(LoginPage, {
    global: {
      plugins: [pinia],
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
}

async function fillAndSubmit(wrapper: ReturnType<typeof mountPage>) {
  await wrapper.find('#vue-login-email').setValue('lina@test.com');
  await wrapper.find('#vue-login-password').setValue('secreta');
  await wrapper.find('form').trigger('submit');
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.push.mockReset();
    mocks.loginUser.mockReset();
  });

  it('renderiza el formulario de inicio de sesión', () => {
    const wrapper = mountPage();

    expect(wrapper.find('h2').text()).toContain('Iniciar Sesión');
    expect(wrapper.find('#vue-login-email').exists()).toBe(true);
    expect(wrapper.find('#vue-login-password').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Ingresar');
    expect(wrapper.text()).not.toContain('El servidor no retornó');
  });

  it('guarda token y usuario y navega al dashboard', async () => {
    mocks.loginUser.mockResolvedValue({
      status: 'ok',
      data: { token: 'jwt-123', user: { id: 5, email: 'lina@test.com' } },
    });
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);
    await flushPromises();

    const store = useAuthStore();
    expect(mocks.loginUser).toHaveBeenCalledWith({
      email: 'lina@test.com',
      password: 'secreta',
    });
    expect(store.token).toBe('jwt-123');
    expect(store.user).toEqual({ id: 5, email: 'lina@test.com' });
    expect(mocks.push).toHaveBeenCalledWith('/dashboard');
  });

  it('acepta el token en la raíz de la respuesta y genera un usuario por defecto', async () => {
    mocks.loginUser.mockResolvedValue({ status: 'ok', token: 'token-legacy' });
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);
    await flushPromises();

    const store = useAuthStore();
    expect(store.token).toBe('token-legacy');
    expect(store.user).toEqual({ id: 1, email: 'lina@test.com' });
    expect(mocks.push).toHaveBeenCalledWith('/dashboard');
  });

  it('muestra un error cuando el servidor no retorna token', async () => {
    mocks.loginUser.mockResolvedValue({ status: 'ok' });
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);
    await flushPromises();

    expect(wrapper.text()).toContain('El servidor no retornó un token válido.');
    expect(mocks.push).not.toHaveBeenCalled();
    expect(useAuthStore().isAuthenticated).toBe(false);
  });

  it('muestra el mensaje de un Error lanzado por el servicio', async () => {
    mocks.loginUser.mockRejectedValue(new Error('Credenciales inválidas'));
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);
    await flushPromises();

    expect(wrapper.text()).toContain('Credenciales inválidas');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('usa el mensaje por defecto ante un fallo desconocido', async () => {
    mocks.loginUser.mockRejectedValue('fallo raro');
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);
    await flushPromises();

    expect(wrapper.text()).toContain('Error al procesar inicio de sesión');
  });

  it('deshabilita el botón mientras envía la petición', async () => {
    mocks.loginUser.mockImplementation(() => new Promise(() => undefined));
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.text()).toBe('Iniciando sesión...');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import RegisterPage from '../RegisterPage.vue';

const mocks = vi.hoisted(() => ({ push: vi.fn(), registerUser: vi.fn() }));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
  useRoute: () => ({ params: {} }),
}));

vi.mock('../../services/authService', () => ({
  registerUser: mocks.registerUser,
  loginUser: vi.fn(),
  fetchUserProfile: vi.fn(),
}));

function mountPage() {
  return mount(RegisterPage, {
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  });
}

async function fillAndSubmit(wrapper: ReturnType<typeof mountPage>) {
  await wrapper.find('#vue-reg-email').setValue('nuevo@test.com');
  await wrapper.find('#vue-reg-password').setValue('clave123');
  await wrapper.find('form').trigger('submit');
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.registerUser.mockReset();
  });

  it('renderiza el formulario de registro', () => {
    const wrapper = mountPage();

    expect(wrapper.find('h2').text()).toContain('Crear Cuenta');
    expect(wrapper.find('#vue-reg-email').exists()).toBe(true);
    expect(wrapper.find('#vue-reg-password').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Registrar');
  });

  it('muestra el éxito y redirige al login tras el retardo', async () => {
    mocks.registerUser.mockResolvedValue({ status: 'ok' });
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);
    await flushPromises();

    expect(mocks.registerUser).toHaveBeenCalledWith({
      email: 'nuevo@test.com',
      password: 'clave123',
    });
    expect(wrapper.text()).toContain('Registro completado con éxito');
    expect(mocks.push).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/login'), {
      timeout: 3000,
    });
  });

  it('muestra el mensaje de un Error lanzado por el servicio', async () => {
    mocks.registerUser.mockRejectedValue(new Error('El correo ya existe'));
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);
    await flushPromises();

    expect(wrapper.text()).toContain('El correo ya existe');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('usa el mensaje por defecto ante un fallo desconocido', async () => {
    mocks.registerUser.mockRejectedValue('fallo raro');
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);
    await flushPromises();

    expect(wrapper.text()).toContain('Error al registrar cuenta');
  });

  it('deshabilita el botón mientras envía la petición', async () => {
    mocks.registerUser.mockImplementation(() => new Promise(() => undefined));
    const wrapper = mountPage();

    await fillAndSubmit(wrapper);

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.text()).toBe('Creando cuenta...');
  });
});

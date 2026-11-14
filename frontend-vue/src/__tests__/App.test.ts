import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';

describe('App', () => {
  it('renderiza el contenedor de rutas', () => {
    const wrapper = mount(App, {
      global: {
        stubs: { RouterView: { template: '<div class="router-view-stub" />' } },
      },
    });

    expect(wrapper.find('.router-view-stub').exists()).toBe(true);
  });
});

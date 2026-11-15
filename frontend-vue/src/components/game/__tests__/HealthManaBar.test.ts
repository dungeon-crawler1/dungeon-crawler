import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import HealthManaBar from '../HealthManaBar.vue';
import { makeHero, makePotion } from '../../../test/fixtures';

const relic = { id: 'rel-1', name: 'Afilador', effectSummary: '+10 Daño', description: 'Suma daño.' };

describe('HealthManaBar', () => {
  it('muestra estadísticas, pociones y reliquias', () => {
    const hero = makeHero({ inventory: [makePotion({ quantity: 2 })], relics: [relic] });
    const wrapper = mount(HealthManaBar, { props: { hero, room: 2, score: 3, disabled: false } });
    expect(wrapper.text()).toContain('Sala #2');
    expect(wrapper.text()).toContain('Puntos: 3');
    expect(wrapper.text()).toContain('Pociones: 2');
    expect(wrapper.text()).toContain('Artefactos Equipados (1)');
  });

  it('muestra y oculta el tooltip de modificadores', async () => {
    const wrapper = mount(HealthManaBar, { props: { hero: makeHero(), room: 1, score: 0, disabled: false } });
    expect(wrapper.text()).not.toContain('Modificadores');
    await wrapper.find('span').trigger('mouseenter');
    expect(wrapper.text()).toContain('Modificadores y Porcentajes');
    await wrapper.find('span').trigger('mouseleave');
    expect(wrapper.text()).not.toContain('Modificadores');
  });

  it('muestra la probabilidad de bloqueo y la estatua en el tooltip', async () => {
    const hero = makeHero({ statueBonus: 'Real: -40 % daño recibido' });
    const wrapper = mount(HealthManaBar, { props: { hero, room: 1, score: 0, disabled: false } });

    await wrapper.find('span').trigger('mouseenter');
    expect(wrapper.text()).toContain('Prob. de Bloqueo: 20 %');
    expect(wrapper.text()).toContain('Estatua: Real: -40 % daño recibido');
  });

  it('emite terminar partida y volver al inicio', async () => {
    const wrapper = mount(HealthManaBar, { props: { hero: makeHero(), room: 1, score: 0, disabled: false } });
    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('forfeit')).toHaveLength(1);
    expect(wrapper.emitted('request-leave')).toHaveLength(1);
  });

  it('oculta la barra de maná para clases sin maná', () => {
    const wrapper = mount(HealthManaBar, { props: { hero: makeHero(), room: 1, score: 0, disabled: false } });
    expect(wrapper.text()).not.toContain('Maná (');
  });

  it('muestra la barra de maná del Mago', () => {
    const hero = makeHero({ heroClass: 'MAGO', mana: 50, maxMana: 100 });
    const wrapper = mount(HealthManaBar, { props: { hero, room: 1, score: 0, disabled: false } });
    expect(wrapper.text()).toContain('Maná (50 / 100)');
  });
});

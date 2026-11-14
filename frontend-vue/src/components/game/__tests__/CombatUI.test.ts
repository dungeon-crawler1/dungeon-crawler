import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CombatUI from '../CombatUI.vue';
import { makeEnemy, makeHero, makePotion } from '../../../test/fixtures';

describe('CombatUI', () => {
  it('muestra el enemigo y emite el ataque', async () => {
    const wrapper = mount(CombatUI, { props: { hero: makeHero(), enemy: makeEnemy(), disabled: false } });
    expect(wrapper.text()).toContain('COMBATE: Orco');
    expect(wrapper.text()).toContain('Atacar (20 daño)');
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('attack')).toHaveLength(1);
  });

  it('usa una poción del inventario', async () => {
    const potion = makePotion();
    const wrapper = mount(CombatUI, { props: { hero: makeHero({ inventory: [potion] }), enemy: makeEnemy(), disabled: false } });
    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.emitted('use-potion')?.[0]).toEqual(['pot-heal-sm']);
  });

  it('informa cuando no hay pociones', () => {
    const wrapper = mount(CombatUI, { props: { hero: makeHero(), enemy: makeEnemy(), disabled: false } });
    expect(wrapper.text()).toContain('No tienes pociones');
  });

  it('muestra los efectos activos de batalla', () => {
    const hero = makeHero({ battleBuffs: { damageBoostPercent: 0.3, evasionBonus: 0.2, defenseBonus: 0.1, blockCharges: 2 } });
    const wrapper = mount(CombatUI, { props: { hero, enemy: makeEnemy(), disabled: false } });
    expect(wrapper.text()).toContain('Daño +30 %');
    expect(wrapper.text()).toContain('Bloqueo: 2 ataque(s)');
  });

  it('oculta el grimorio a las clases sin maná', () => {
    const wrapper = mount(CombatUI, { props: { hero: makeHero(), enemy: makeEnemy(), disabled: false } });
    expect(wrapper.text()).not.toContain('Grimorio');
  });

  it('habilita y emite los hechizos del Mago según su maná', async () => {
    const hero = makeHero({ heroClass: 'MAGO', mana: 45, maxMana: 100 });
    const wrapper = mount(CombatUI, { props: { hero, enemy: makeEnemy(), disabled: false } });
    const buttons = wrapper.findAll('button');
    expect(buttons[1].attributes('disabled')).toBeUndefined();
    expect(buttons[2].attributes('disabled')).toBeDefined();
    await buttons[1].trigger('click');
    expect(wrapper.emitted('cast-spell')?.[0]).toEqual(['BOLA_FUEGO']);
  });
});

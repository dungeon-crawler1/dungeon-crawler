import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CombatUI from '../CombatUI.vue';
import { makeEnemy, makeHero, makePotion } from '../../../test/fixtures';

function mountCombat(overrides: Record<string, unknown> = {}) {
  return mount(CombatUI, {
    props: { hero: makeHero(), enemies: [makeEnemy()], targetIndex: 0, disabled: false, ...overrides },
  });
}

describe('CombatUI', () => {
  it('muestra los enemigos y emite el ataque', async () => {
    const wrapper = mountCombat();
    expect(wrapper.text()).toContain('COMBATE');
    expect(wrapper.text()).toContain('Orco');
    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.emitted('attack')).toHaveLength(1);
  });

  it('permite seleccionar el objetivo', async () => {
    const wrapper = mountCombat();
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('select-target')?.[0]).toEqual([0]);
  });

  it('usa una poción del inventario', async () => {
    const wrapper = mountCombat({ hero: makeHero({ inventory: [makePotion()] }) });
    await wrapper.findAll('button')[2].trigger('click');
    expect(wrapper.emitted('use-potion')?.[0]).toEqual(['pot-heal-sm']);
  });

  it('informa cuando no hay pociones', () => {
    const wrapper = mountCombat();
    expect(wrapper.text()).toContain('No tenés pociones');
  });

  it('muestra los efectos activos de batalla', () => {
    const hero = makeHero({ battleBuffs: { damageBoostPercent: 0.3, evasionBonus: 0.2, defenseBonus: 0.1, blockCharges: 2 } });
    const wrapper = mountCombat({ hero });
    expect(wrapper.text()).toContain('Daño +30 %');
    expect(wrapper.text()).toContain('Bloqueo: 2');
  });

  it('oculta el grimorio a las clases sin maná', () => {
    const wrapper = mountCombat();
    expect(wrapper.text()).not.toContain('Grimorio');
  });

  it('habilita y emite los seis hechizos del Mago', async () => {
    const hero = makeHero({ heroClass: 'MAGO', mana: 100, maxMana: 100 });
    const wrapper = mountCombat({ hero });
    const buttons = wrapper.findAll('button');
    expect(wrapper.text()).toContain('Bola de Fuego');
    expect(wrapper.text()).toContain('Fuerza 5 turnos');
    await buttons[2].trigger('click');
    expect(wrapper.emitted('cast-spell')?.[0]).toEqual(['BOLA_FUEGO']);
  });

  it('deshabilita los hechizos sin maná suficiente', () => {
    const hero = makeHero({ heroClass: 'MAGO', mana: 20, maxMana: 100 });
    const wrapper = mountCombat({ hero });
    const buttons = wrapper.findAll('button');
    expect(buttons[2].attributes('disabled')).toBeDefined();
  });
});

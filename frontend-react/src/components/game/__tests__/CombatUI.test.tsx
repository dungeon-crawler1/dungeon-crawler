import { describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import { CombatUI } from '../CombatUI';
import { makeEnemy, makeHero, makePotion } from '../../../test/fixtures';

function setup(overrides: Partial<ComponentProps<typeof CombatUI>> = {}) {
  const props = {
    hero: makeHero(), enemies: [makeEnemy()], targetIndex: 0, disabled: false,
    onSelectTarget: vi.fn(), onAttack: vi.fn(), onUsePotion: vi.fn(), onCastSpell: vi.fn(),
    ...overrides,
  };
  return { props, view: render(<CombatUI {...props} />) };
}

describe('CombatUI', () => {
  it('muestra los enemigos y emite el ataque', () => {
    const { props, view } = setup();
    expect(view.getByText(/COMBATE/)).toBeTruthy();
    expect(view.getByText(/Orco/)).toBeTruthy();
    view.getByText(/Atacar/).click();
    expect(props.onAttack).toHaveBeenCalled();
  });

  it('permite seleccionar el objetivo', () => {
    const { props, view } = setup();
    view.getByText(/Orco/).click();
    expect(props.onSelectTarget).toHaveBeenCalledWith(0);
  });

  it('usa una poción del inventario', () => {
    const { props, view } = setup({ hero: makeHero({ inventory: [makePotion()] }) });
    view.getByText('Usar Poción').click();
    expect(props.onUsePotion).toHaveBeenCalledWith('pot-heal-sm');
  });

  it('informa cuando no hay pociones', () => {
    const { view } = setup();
    expect(view.getByText('No tenés pociones guardadas.')).toBeTruthy();
  });

  it('muestra los efectos activos de batalla', () => {
    const hero = makeHero({ battleBuffs: { damageBoostPercent: 0.3, evasionBonus: 0.2, defenseBonus: 0.1, blockCharges: 2 } });
    const { view } = setup({ hero });
    expect(view.getByText(/Daño \+30 %/)).toBeTruthy();
    expect(view.getByText(/Bloqueo: 2/)).toBeTruthy();
  });

  it('oculta el grimorio a las clases sin maná', () => {
    const { view } = setup();
    expect(view.queryByText(/Grimorio/)).toBeNull();
  });

  it('lanza los seis hechizos del Mago', () => {
    const hero = makeHero({ heroClass: 'MAGO', mana: 100, maxMana: 100 });
    const { props, view } = setup({ hero });
    expect(view.getByText(/Bola de Fuego/)).toBeTruthy();
    expect(view.getByText(/Fuerza 5 turnos/)).toBeTruthy();
    view.getByText(/Bola de Fuego/).click();
    expect(props.onCastSpell).toHaveBeenCalledWith('BOLA_FUEGO');
  });

  it('deshabilita los hechizos sin maná suficiente', () => {
    const hero = makeHero({ heroClass: 'MAGO', mana: 20, maxMana: 100 });
    const { view } = setup({ hero });
    expect((view.getByText(/Bola de Fuego/) as HTMLButtonElement).disabled).toBe(true);
  });
});

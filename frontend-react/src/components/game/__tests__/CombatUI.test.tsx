import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CombatUI } from '../CombatUI';
import { makeEnemy, makeHero, makePotion } from '../../../test/fixtures';

const enemy = makeEnemy({ name: 'Orco', hp: 30, maxHp: 50, attack: 12, goldReward: 25 });
const baseHandlers = { onAttack: vi.fn(), onUsePotion: vi.fn(), onCastSpell: vi.fn() };

describe('CombatUI', () => {
  it('muestra los datos del enemigo y el daño del ataque físico', () => {
    render(<CombatUI hero={makeHero()} enemy={enemy} {...baseHandlers} disabled={false} />);

    expect(screen.getByText(/COMBATE: Orco/)).toBeTruthy();
    expect(screen.getByText(/Vida del Enemigo \(30 \/ 50\)/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '⚔️ Atacar (20 daño)' })).toBeTruthy();
    expect(screen.getByText('No tienes pociones guardadas en tu inventario.')).toBeTruthy();
    expect(screen.queryByText(/Grimorio del Mago/)).toBeNull();
  });

  it('muestra buffs activos y permite atacar y usar una poción', () => {
    const handlers = { onAttack: vi.fn(), onUsePotion: vi.fn(), onCastSpell: vi.fn() };
    const hero = makeHero({
      inventory: [makePotion()],
      battleBuffs: { damageBoostPercent: 0.3, evasionBonus: 0.2, defenseBonus: 0.4, blockCharges: 2 },
    });
    render(<CombatUI hero={hero} enemy={enemy} {...handlers} disabled={false} />);

    const buffs = screen.getByText(/Efectos activos en batalla/).textContent ?? '';
    expect(buffs).toContain('Daño +30 %');
    expect(buffs).toContain('Bloqueo: 2 ataque(s)');
    fireEvent.click(screen.getByRole('button', { name: /Atacar/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Usar Poción' }));

    expect(handlers.onAttack).toHaveBeenCalledTimes(1);
    expect(handlers.onUsePotion).toHaveBeenCalledWith('pot-heal-sm');
  });

  it('habilita el grimorio del Mago y lanza cada hechizo', () => {
    const handlers = { onAttack: vi.fn(), onUsePotion: vi.fn(), onCastSpell: vi.fn() };
    const mago = makeHero({ heroClass: 'MAGO', mana: 100, maxMana: 100 });
    render(<CombatUI hero={mago} enemy={enemy} {...handlers} disabled={false} />);

    expect(screen.getByText(/Grimorio del Mago \(Maná: 100\/100\)/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Bola de Fuego/ }));
    fireEvent.click(screen.getByRole('button', { name: /Rayo/ }));
    fireEvent.click(screen.getByRole('button', { name: /Escudo 2 Golpes/ }));
    fireEvent.click(screen.getByRole('button', { name: /Escape Arcano/ }));

    expect(handlers.onCastSpell.mock.calls).toEqual([['BOLA_FUEGO'], ['RAYO'], ['ESCUDO'], ['ESCAPE']]);
  });

  it('deshabilita hechizos y acciones cuando falta maná o está ocupado', () => {
    const mago = makeHero({ heroClass: 'MAGO', mana: 10, maxMana: 100 });
    render(<CombatUI hero={mago} enemy={enemy} {...baseHandlers} disabled />);

    screen.getAllByRole('button').forEach((button) => expect(button).toHaveProperty('disabled', true));
  });
});

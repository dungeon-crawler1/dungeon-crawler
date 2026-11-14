import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HealthManaBar } from '../HealthManaBar';
import { RelicsDropdown } from '../RelicsDropdown';
import { makeHero, makePotion } from '../../../test/fixtures';

describe('HealthManaBar', () => {
  it('muestra estadísticas y permite terminar o abandonar la partida', () => {
    const onForfeit = vi.fn();
    const onRequestLeave = vi.fn();
    const hero = makeHero({ inventory: [makePotion({ quantity: 2 })] });
    render(<HealthManaBar hero={hero} room={3} score={5} onForfeit={onForfeit} onRequestLeave={onRequestLeave} disabled={false} />);

    expect(screen.getByText('Caballero')).toBeTruthy();
    expect(screen.getByText(/Sala #3/).textContent).toContain('Pociones: 2');
    expect(screen.getByText(/Vida \(100 \/ 100\)/)).toBeTruthy();
    expect(screen.queryByText(/Maná/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '🏳️ Terminar Partida' }));
    fireEvent.click(screen.getByRole('button', { name: '🏠 Volver al Inicio' }));
    expect(onForfeit).toHaveBeenCalledTimes(1);
    expect(onRequestLeave).toHaveBeenCalledTimes(1);
  });

  it('despliega y oculta el tooltip de modificadores', () => {
    render(<HealthManaBar hero={makeHero()} room={1} score={0} onForfeit={vi.fn()} onRequestLeave={vi.fn()} disabled={false} />);

    expect(screen.queryByText(/Modificadores y Porcentajes/)).toBeNull();
    fireEvent.mouseEnter(screen.getByText('...'));
    expect(screen.getByText(/Modificadores y Porcentajes/)).toBeTruthy();
    expect(screen.getByText(/Descuento en Mercaderes/)).toBeTruthy();
    fireEvent.mouseLeave(screen.getByText('...'));
    expect(screen.queryByText(/Modificadores y Porcentajes/)).toBeNull();
  });

  it('muestra la barra de maná cuando la clase posee maná', () => {
    const mago = makeHero({ heroClass: 'MAGO', mana: 70, maxMana: 100, percentAttackBonus: 0.5 });
    render(<HealthManaBar hero={mago} room={2} score={1} onForfeit={vi.fn()} onRequestLeave={vi.fn()} disabled={false} />);

    expect(screen.getByText(/Maná \(70 \/ 100\)/)).toBeTruthy();
    fireEvent.mouseEnter(screen.getByText('...'));
    expect(screen.getByText(/Daño Extra: \+50 %/)).toBeTruthy();
  });
});

describe('RelicsDropdown', () => {
  it('indica cuando no hay reliquias y permite abrir y cerrar', () => {
    render(<RelicsDropdown relics={[]} />);
    const toggle = screen.getByRole('button', { name: /Artefactos Equipados \(0\)/ });

    fireEvent.click(toggle);
    expect(screen.getByText('Aún no posees ningún artefacto o reliquia en esta partida.')).toBeTruthy();
    expect(toggle.textContent).toContain('▲');
    fireEvent.click(toggle);
    expect(screen.queryByText('Aún no posees ningún artefacto o reliquia en esta partida.')).toBeNull();
  });

  it('lista las reliquias equipadas con su efecto', () => {
    const relic = { id: 'r1', name: 'Escudo de Acero', effectSummary: '-25 % Daño', description: 'Protege.' };
    render(<RelicsDropdown relics={[relic]} />);

    fireEvent.click(screen.getByRole('button', { name: /Artefactos Equipados \(1\)/ }));
    expect(screen.getByText('Escudo de Acero')).toBeTruthy();
    expect(screen.getByText('-25 % Daño')).toBeTruthy();
    expect(screen.getByText(/Protege\./)).toBeTruthy();
  });
});

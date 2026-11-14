import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GamePage } from '../GamePage';
import { useGameEngine } from '../../hooks/useGameEngine';
import type { Door, GameState } from '../../types/game';
import { makeEnemy, makeHero, makeItem, makePotion } from '../../test/fixtures';

vi.mock('../../hooks/useGameEngine', () => ({ useGameEngine: vi.fn() }));

const engineMock = vi.mocked(useGameEngine);
const door: Door = { id: 'd1', type: 'COMBAT', icon: '⚔️', title: 'Cámara de Combate', description: 'Peligro.' };
const baseState: GameState = {
  runId: 1,
  hero: makeHero(),
  currentRoom: 1,
  score: 0,
  inCombat: false,
  enemy: null,
  availableDoors: [],
  merchantItems: [],
  isLuxuryMerchant: false,
  currentEvent: null,
  logs: ['[Sala #1] Inicio de la partida.'],
  isFinished: false,
  finishReason: null,
  showLeaveConfirm: false,
};

const handlers = {
  selectClass: vi.fn(),
  chooseDoor: vi.fn(),
  attackEnemy: vi.fn(),
  usePotion: vi.fn(),
  castSpell: vi.fn(),
  buyItem: vi.fn(),
  closeMerchant: vi.fn(),
  resolveEvent: vi.fn(),
  forfeitRun: vi.fn(),
  resetRun: vi.fn(),
  openLeaveConfirm: vi.fn(),
  closeLeaveConfirm: vi.fn(),
};

function mockEngine(state: Partial<GameState>, error: string | null = null) {
  engineMock.mockReturnValue({
    state: { ...baseState, ...state },
    loading: false,
    error,
    ...handlers,
  } as ReturnType<typeof useGameEngine>);
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/game']}>
      <Routes>
        <Route path="/game" element={<GamePage />} />
        <Route path="/dashboard" element={<div>Dashboard destino</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el selector de clase y los errores de inicio', () => {
    mockEngine({ hero: null }, 'No se pudo iniciar');
    renderPage();

    expect(screen.getByText('⚠️ No se pudo iniciar')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Elegir Mago' }));

    expect(handlers.selectClass).toHaveBeenCalledWith('MAGO');
  });

  it('muestra el resumen final y sus acciones', () => {
    mockEngine({ isFinished: true, finishReason: 'DERROTA', score: 3 });
    renderPage();

    expect(screen.getByText('💀 Has Caído en la Mazmorra')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '🔄 Jugar Nueva Partida' }));
    expect(handlers.resetRun).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: '🏠 Volver a la Pantalla de Inicio' }));
    expect(screen.getByText('Dashboard destino')).toBeTruthy();
  });

  it('muestra puertas, bitácora y acciones del HUD', () => {
    mockEngine({ availableDoors: [door] });
    renderPage();

    expect(screen.getByText('Cámara de Combate')).toBeTruthy();
    expect(screen.getByText('[Sala #1] Inicio de la partida.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cruzar Puerta' }));
    expect(handlers.chooseDoor).toHaveBeenCalledWith(door);

    fireEvent.click(screen.getByRole('button', { name: '🏳️ Terminar Partida' }));
    fireEvent.click(screen.getByRole('button', { name: '🏠 Volver al Inicio' }));
    expect(handlers.forfeitRun).toHaveBeenCalledTimes(1);
    expect(handlers.openLeaveConfirm).toHaveBeenCalledTimes(1);
  });

  it('muestra el combate y despacha ataque y pociones', () => {
    mockEngine({ inCombat: true, enemy: makeEnemy(), hero: makeHero({ inventory: [makePotion()] }) });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Atacar/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Usar Poción' }));

    expect(handlers.attackEnemy).toHaveBeenCalledTimes(1);
    expect(handlers.usePotion).toHaveBeenCalledWith('pot-heal-sm');
  });

  it('muestra el mercader y despacha compra y cierre', () => {
    const item = makeItem({ id: 'p1', type: 'POCION', effectType: 'HEAL', price: 20 });
    mockEngine({ merchantItems: [item], hero: makeHero({ gold: 100 }) });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Comprar (🪙 20)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar Explorando' }));

    expect(handlers.buyItem).toHaveBeenCalledWith(item);
    expect(handlers.closeMerchant).toHaveBeenCalledTimes(1);
  });

  it('muestra el evento y despacha ambas respuestas', () => {
    mockEngine({ currentEvent: { title: 'Fuente', description: 'Desea.', type: 'WISH_FOUNTAIN' } });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Interactuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ignorar y Seguir' }));

    expect(handlers.resolveEvent.mock.calls).toEqual([['ACCEPT'], ['IGNORE']]);
  });

  it('confirma la salida al panel principal', () => {
    mockEngine({ showLeaveConfirm: true });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Perderás tu progreso/ }));

    expect(screen.getByText('Dashboard destino')).toBeTruthy();
  });

  it('cancela la salida y continúa en la partida', () => {
    mockEngine({ showLeaveConfirm: true });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar y Seguir Jugando' }));

    expect(handlers.closeLeaveConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Dashboard destino')).toBeNull();
  });
});

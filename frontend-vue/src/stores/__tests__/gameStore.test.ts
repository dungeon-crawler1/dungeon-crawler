import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { makeEnemy, makeHero, makeItem, makePotion } from '../../test/fixtures';
import type { Door, GameEvent, GameState } from '../../types/game';

const mocks = vi.hoisted(() => ({
  startGameRun: vi.fn(),
  syncRunTurn: vi.fn(),
  spawnEnemyForRoom: vi.fn(),
  spawnEncounterForRoom: vi.fn(),
}));

vi.mock('../../services/gameService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/gameService')>();
  return { ...actual, startGameRun: mocks.startGameRun, syncRunTurn: mocks.syncRunTurn };
});

vi.mock('../../../../shared/game/gameContent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../shared/game/gameContent')>();
  return { ...actual, spawnEnemyForRoom: mocks.spawnEnemyForRoom, spawnEncounterForRoom: mocks.spawnEncounterForRoom };
});

import { useGameStore } from '../gameStore';

function startedState(overrides: Partial<GameState> = {}): GameState {
  return {
    runId: 7, hero: makeHero(), currentRoom: 1, score: 0, inCombat: false, enemy: null,
    availableDoors: [], merchantItems: [], isLuxuryMerchant: false, currentEvent: null,
    logs: [], isFinished: false, finishReason: null, showLeaveConfirm: false, ...overrides,
  };
}

function door(type: Door['type'] = 'COMBAT'): Door {
  return { id: 'door-1', type, icon: '🚪', title: 'Cámara de Combate', description: 'Sala.' };
}

function event(): GameEvent {
  return { title: 'Sala del Tesoro', description: 'Cofre.', type: 'TREASURE' };
}

let store: ReturnType<typeof useGameStore>;

beforeEach(() => {
  setActivePinia(createPinia());
  store = useGameStore();
  vi.restoreAllMocks();
  mocks.startGameRun.mockReset();
  mocks.syncRunTurn.mockReset().mockResolvedValue(undefined);
  mocks.spawnEnemyForRoom.mockReset();
  mocks.spawnEncounterForRoom.mockReset();
});

describe('selectClass', () => {
  it('inicia la partida y guarda el estado', async () => {
    mocks.startGameRun.mockResolvedValue(startedState({ hero: makeHero({ heroClass: 'MAGO' }) }));
    await store.selectClass('MAGO');
    expect(mocks.startGameRun).toHaveBeenCalledWith('MAGO');
    expect(store.state.hero?.heroClass).toBe('MAGO');
    expect(store.loading).toBe(false);
  });

  it('expone el error cuando el backend falla', async () => {
    mocks.startGameRun.mockRejectedValue(new Error('sin conexión'));
    await store.selectClass('MAGO');
    expect(store.error).toBe('sin conexión');
    expect(store.loading).toBe(false);
  });
});

describe('chooseDoor', () => {
  it('inicia un combate con el enemigo generado', () => {
    store.state = startedState();
    mocks.spawnEncounterForRoom.mockReturnValue([makeEnemy()]);
    store.chooseDoor(door());
    expect(store.state.inCombat).toBe(true);
    expect(store.state.enemy?.name).toBe('Orco');
  });

  it('no hace nada sin héroe', () => {
    store.chooseDoor(door());
    expect(store.state.inCombat).toBe(false);
  });
});

describe('combate', () => {
  it('aplica daño sin matar al enemigo y recibe contraataque', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    store.state = startedState({ inCombat: true, enemy: makeEnemy({ hp: 100, maxHp: 100 }) });
    await store.attackEnemy();
    expect(store.state.enemy?.hp).toBe(80);
    expect(store.state.hero?.hp).toBe(90);
  });

  it('al vencer completa la sala y sincroniza el turno', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    store.state = startedState({ inCombat: true, enemy: makeEnemy({ hp: 10, maxHp: 10 }) });
    await store.attackEnemy();
    expect(store.state.score).toBe(1);
    expect(store.state.inCombat).toBe(false);
    expect(mocks.syncRunTurn).toHaveBeenCalledWith(7, expect.objectContaining({ puntuacion: 1 }));
  });

  it('finaliza la partida cuando el héroe cae', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    store.state = startedState({ inCombat: true, enemy: makeEnemy({ attack: 100 }), hero: makeHero({ hp: 5 }) });
    await store.attackEnemy();
    expect(store.state.isFinished).toBe(true);
    expect(store.state.finishReason).toBe('DERROTA');
  });

  it('no ataca sin enemigo', async () => {
    store.state = startedState();
    await store.attackEnemy();
    expect(store.state.enemy).toBeNull();
  });

  it('el escudo arcano consume maná y carga dos bloqueos', async () => {
    store.state = startedState({ hero: makeHero({ heroClass: 'MAGO', mana: 100, maxMana: 100 }) });
    await store.castSpell('ESCUDO');
    expect(store.state.hero?.mana).toBe(60);
    expect(store.state.hero?.shieldCharges).toBe(2);
  });

  it('el escape arcano vuelve a elegir puerta', async () => {
    store.state = startedState({ inCombat: true, enemy: makeEnemy(), hero: makeHero({ heroClass: 'MAGO', mana: 100, maxMana: 100 }) });
    await store.castSpell('ESCAPE');
    expect(store.state.hero?.mana).toBe(40);
    expect(store.state.inCombat).toBe(false);
    expect(store.state.availableDoors.length).toBeGreaterThan(0);
  });

  it('los hechizos de daño consumen maná y dañan al enemigo', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    store.state = startedState({ inCombat: true, enemy: makeEnemy({ hp: 500, maxHp: 500 }), hero: makeHero({ heroClass: 'MAGO', mana: 100, maxMana: 100 }) });
    await store.castSpell('BOLA_FUEGO');
    expect(store.state.hero?.mana).toBe(70);
    expect(store.state.enemy?.hp).toBeLessThan(500);
  });
});

describe('inventario y mercader', () => {
  it('compra una poción y la guarda', () => {
    store.state = startedState();
    store.buyItem(makeItem({ id: 'pot-heal-md', type: 'POCION', effectType: 'HEAL', price: 30 }));
    expect(store.state.hero?.gold).toBe(70);
    expect(store.state.hero?.inventory).toHaveLength(1);
  });

  it('compra una reliquia y la quita del stock', () => {
    store.state = startedState({ merchantItems: [makeItem({ id: 'rel-1', price: 50 })] });
    store.buyItem(store.state.merchantItems[0]);
    expect(store.state.hero?.relics).toHaveLength(1);
    expect(store.state.merchantItems).toHaveLength(0);
  });

  it('no compra sin oro suficiente', () => {
    store.state = startedState({ hero: makeHero({ gold: 10 }) });
    store.buyItem(makeItem({ price: 50 }));
    expect(store.state.hero?.gold).toBe(10);
  });

  it('usa una poción curativa', () => {
    store.state = startedState({ hero: makeHero({ hp: 50, inventory: [makePotion()] }) });
    store.usePotion('pot-heal-sm');
    expect(store.state.hero?.hp).toBe(100);
    expect(store.state.hero?.inventory).toHaveLength(0);
  });

  it('ignora pociones sin héroe', () => {
    store.usePotion('pot-heal-sm');
    expect(store.state.hero).toBeNull();
  });

  it('salir del mercader avanza de sala', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    store.state = startedState({ merchantItems: [makeItem()] });
    await store.closeMerchant();
    expect(store.state.score).toBe(1);
    expect(store.state.merchantItems).toHaveLength(0);
  });
});

describe('eventos y cierre', () => {
  it('resuelve un evento aceptado', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    store.state = startedState({ currentEvent: event() });
    await store.resolveEvent('ACCEPT');
    expect(store.state.hero?.gold).toBe(160);
    expect(store.state.score).toBe(1);
  });

  it('ignora eventos sin héroe o sin evento', async () => {
    store.state = startedState({ currentEvent: event() });
    await store.resolveEvent('ACCEPT');
    store.state = startedState();
    await store.resolveEvent('ACCEPT');
    expect(store.state.score).toBe(0);
  });

  it('finaliza por retiro y sincroniza', async () => {
    store.state = startedState();
    await store.forfeitRun();
    expect(store.state.isFinished).toBe(true);
    expect(store.state.finishReason).toBe('VICTORIA_RETIRO');
    expect(mocks.syncRunTurn).toHaveBeenCalledWith(7, expect.objectContaining({ resultado: 'FINALIZADA' }));
  });

  it('no sincroniza cuando la partida no tiene runId', async () => {
    store.state = startedState({ runId: null });
    await store.forfeitRun();
    expect(mocks.syncRunTurn).not.toHaveBeenCalled();
  });

  it('reinicia el estado y controla el modal de salida', () => {
    store.state = startedState({ score: 4 });
    store.openLeaveConfirm();
    expect(store.state.showLeaveConfirm).toBe(true);
    store.closeLeaveConfirm();
    expect(store.state.showLeaveConfirm).toBe(false);
    store.resetRun();
    expect(store.state.score).toBe(0);
    expect(store.state.hero).toBeNull();
  });
});

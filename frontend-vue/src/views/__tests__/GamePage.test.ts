import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { makeEnemy, makeHero, makeItem } from '../../test/fixtures';
import type { GameState } from '../../types/game';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  startGameRun: vi.fn(),
  syncRunTurn: vi.fn(),
  spawnEnemyForRoom: vi.fn(),
  spawnEncounterForRoom: vi.fn(),
}));

vi.mock('vue-router', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('../../services/gameService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/gameService')>();
  return { ...actual, startGameRun: mocks.startGameRun, syncRunTurn: mocks.syncRunTurn };
});

vi.mock('../../../../shared/game/gameContent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../shared/game/gameContent')>();
  return { ...actual, spawnEnemyForRoom: mocks.spawnEnemyForRoom, spawnEncounterForRoom: mocks.spawnEncounterForRoom };
});

import GamePage from '../GamePage.vue';
import { useGameStore } from '../../stores/gameStore';
import DoorSelector from '../../components/game/DoorSelector.vue';
import CombatUI from '../../components/game/CombatUI.vue';
import MerchantModal from '../../components/game/MerchantModal.vue';
import EventModal from '../../components/game/EventModal.vue';
import HealthManaBar from '../../components/game/HealthManaBar.vue';
import LeaveConfirmModal from '../../components/game/LeaveConfirmModal.vue';

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    runId: 3, hero: makeHero(), currentRoom: 1, score: 0, inCombat: false, enemy: null,
    availableDoors: [{ id: 'd1', type: 'COMBAT', icon: '⚔️', title: 'Cámara de Combate', description: 'Enemigos.' }],
    merchantItems: [], isLuxuryMerchant: false, currentEvent: null,
    logs: ['Inicio'], isFinished: false, finishReason: null, showLeaveConfirm: false, ...overrides,
  };
}

function mountPage(overrides: Partial<GameState> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const store = useGameStore();
  store.state = baseState(overrides);
  const wrapper = mount(GamePage, { global: { plugins: [pinia] } });
  return { wrapper, store };
}

beforeEach(() => {
  mocks.push.mockReset();
  mocks.syncRunTurn.mockReset().mockResolvedValue(undefined);
  mocks.spawnEnemyForRoom.mockReset().mockReturnValue(makeEnemy());
  mocks.spawnEncounterForRoom.mockReset().mockReturnValue([makeEnemy()]);
});

describe('GamePage', () => {
  it('muestra el selector de clase y el error', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useGameStore();
    const wrapper = mount(GamePage, { global: { plugins: [pinia] } });
    expect(wrapper.text()).toContain('Selecciona tu Clase');
    store.error = 'sin servidor';
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('sin servidor');
  });

  it('muestra las puertas y avanza al combate al elegir una', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const { wrapper } = mountPage();
    expect(wrapper.text()).toContain('Elige tu Siguiente Camino');
    await wrapper.findComponent(DoorSelector).find('button').trigger('click');
    expect(wrapper.text()).toContain('COMBATE');
  });

  it('muestra la interfaz de combate y permite atacar', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const enemy = makeEnemy({ hp: 500, maxHp: 500 });
    const { wrapper } = mountPage({ inCombat: true, enemy, enemies: [enemy] });
    expect(wrapper.text()).toContain('COMBATE');
    expect(wrapper.text()).toContain('Orco');
    await wrapper.findComponent(CombatUI).findAll('button')[1].trigger('click');
    expect(wrapper.text()).toContain('480 / 500');
  });

  it('muestra el mercader y permite comprar', async () => {
    const { wrapper } = mountPage({ merchantItems: [makeItem({ id: 'rel-1', price: 50 })] });
    expect(wrapper.text()).toContain('Mercader Común');
    await wrapper.findComponent(MerchantModal).findAll('button')[0].trigger('click');
    expect(wrapper.text()).toContain('Artefactos Equipados (1)');
  });

  it('muestra un evento y lo resuelve', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { wrapper } = mountPage({ currentEvent: { title: 'Sala del Tesoro', description: 'Cofre.', type: 'TREASURE' } });
    expect(wrapper.text()).toContain('Evento Misterioso');
    await wrapper.findComponent(EventModal).findAll('button')[0].trigger('click');
    expect(wrapper.text()).toContain('Sala #2');
  });

  it('muestra el resumen final y permite reiniciar', async () => {
    const { wrapper } = mountPage({ isFinished: true, finishReason: 'DERROTA', score: 4, hero: makeHero({ gold: 30 }) });
    expect(wrapper.text()).toContain('Has Caído');
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.text()).toContain('Selecciona tu Clase');
  });

  it('vuelve al inicio desde el resumen', async () => {
    const { wrapper } = mountPage({ isFinished: true, finishReason: 'VICTORIA_RETIRO' });
    await wrapper.findAll('button')[1].trigger('click');
    expect(mocks.push).toHaveBeenCalledWith('/dashboard');
  });

  it('gestiona el modal de salida', async () => {
    const { wrapper, store } = mountPage({ showLeaveConfirm: true });
    await wrapper.findComponent(LeaveConfirmModal).findAll('button')[1].trigger('click');
    expect(store.state.showLeaveConfirm).toBe(false);
    store.openLeaveConfirm();
    await wrapper.vm.$nextTick();
    await wrapper.findComponent(LeaveConfirmModal).findAll('button')[0].trigger('click');
    expect(mocks.push).toHaveBeenCalledWith('/dashboard');
  });

  it('termina la partida desde el HUD', async () => {
    const { wrapper } = mountPage();
    await wrapper.findComponent(HealthManaBar).findAll('button')[0].trigger('click');
    expect(wrapper.text()).toContain('Partida Finalizada por Retiro');
  });
});

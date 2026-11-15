// =============================================================================
// STORE DEL MOTOR DE JUEGO EN VUE (PARIDAD CON EL HOOK DE REACT)
// =============================================================================
import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Door, GameState, HeroClassId, ShopItem, SpellId } from '../types/game';
import { startGameRun, syncRunTurn } from '../services/gameService';
import { applyShopPurchase, consumeInventoryPotion } from '../utils/combatLogic';
import { applyEventEffect, resolveDoorEncounter } from '../utils/roomLogic';
import { advanceRoom, appendLogs, castSpell as castSpellTurn, firstTarget, performAttack, usePotionTurn } from '../../../shared/game/turnLogic';

const INITIAL_STATE: GameState = {
  runId: null, hero: null, currentRoom: 1, score: 0, inCombat: false, enemy: null, enemies: [],
  targetIndex: 0, availableDoors: [], merchantItems: [], isLuxuryMerchant: false, currentEvent: null,
  logs: [], isFinished: false, finishReason: null, showLeaveConfirm: false,
};

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState>({ ...INITIAL_STATE });
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function sync(payload: Record<string, unknown>): Promise<void> {
    return state.value.runId ? syncRunTurn(state.value.runId, payload) : Promise.resolve();
  }

  async function selectClass(classId: HeroClassId): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      state.value = await startGameRun(classId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al iniciar la partida';
    } finally {
      loading.value = false;
    }
  }

  async function settle(next: GameState, allDead: boolean, heroDead: boolean): Promise<void> {
    if (heroDead) {
      state.value = next;
      await sync({ puntuacion: next.score, vida: 0, monedas: next.hero?.gold ?? 0, resultado: 'DERROTA', evento: 'Derrota' });
      return;
    }
    if (allDead) {
      const advanced = advanceRoom(next);
      const withLog = { ...advanced, logs: appendLogs(advanced, [`¡Sala superada! Puntuación: ${advanced.score}.`]) };
      state.value = withLog;
      await sync({ puntuacion: withLog.score, vida: withLog.hero?.hp ?? 0, monedas: withLog.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: 'Sala superada' });
      return;
    }
    state.value = next;
  }

  function chooseDoor(door: Door): void {
    if (!state.value.hero) return;
    const encounter = resolveDoorEncounter(door, state.value.hero, state.value.score);
    state.value = {
      ...state.value, inCombat: encounter.inCombat, enemy: encounter.enemy, enemies: encounter.enemies,
      targetIndex: firstTarget(encounter.enemies), merchantItems: encounter.merchantItems,
      isLuxuryMerchant: encounter.isLuxuryMerchant, currentEvent: encounter.currentEvent,
      logs: appendLogs(state.value, [encounter.log]),
    };
  }

  async function attackEnemy(): Promise<void> {
    const outcome = performAttack(state.value);
    await settle(outcome.state, outcome.allDead, outcome.heroDead);
  }

  async function castSpell(spell: SpellId): Promise<void> {
    const outcome = castSpellTurn(state.value, spell);
    await settle(outcome.state, outcome.allDead, outcome.heroDead);
  }

  function usePotion(potionId: string): void {
    const outcome = usePotionTurn(state.value, potionId, consumeInventoryPotion);
    state.value = outcome.state;
  }

  function selectTarget(index: number): void {
    const target = state.value.enemies?.[index];
    if (target && target.hp > 0) state.value = { ...state.value, targetIndex: index, enemy: target };
  }

  function buyItem(item: ShopItem): void {
    const hero = state.value.hero;
    if (!hero || hero.gold < item.price) return;
    const stock = item.type === 'RELIQUIA' ? state.value.merchantItems.filter((i) => i.id !== item.id) : state.value.merchantItems;
    const note = item.type === 'POCION' ? 'guardada en inventario' : `equipada (${item.effectSummary})`;
    state.value = {
      ...state.value, hero: applyShopPurchase(hero, item), merchantItems: stock,
      logs: appendLogs(state.value, [`Compraste [${item.name}] (${note}, -${item.price} monedas).`]),
    };
  }

  async function resolveEvent(option: string): Promise<void> {
    const hero = state.value.hero;
    const event = state.value.currentEvent;
    if (!hero || !event) return;
    const result = applyEventEffect(hero, event, option === 'ACCEPT');
    const advanced = advanceRoom({ ...state.value, hero: result.hero, currentEvent: null, logs: appendLogs(state.value, [result.message]) });
    state.value = advanced;
    await sync({ puntuacion: advanced.score, vida: advanced.hero?.hp ?? 0, monedas: advanced.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: result.message });
  }

  async function closeMerchant(): Promise<void> {
    if (!state.value.hero) return;
    const advanced = advanceRoom(state.value);
    state.value = { ...advanced, logs: appendLogs(advanced, ['Saliste de la tienda.']) };
    await sync({ puntuacion: advanced.score, vida: advanced.hero?.hp ?? 0, monedas: advanced.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: 'Mercader' });
  }

  async function forfeitRun(): Promise<void> {
    state.value = { ...state.value, isFinished: true, finishReason: 'VICTORIA_RETIRO' };
    const hero = state.value.hero;
    if (hero) await sync({ puntuacion: state.value.score, vida: hero.hp, monedas: hero.gold, resultado: 'FINALIZADA', evento: 'Retiro voluntario' });
  }

  function resetRun(): void {
    state.value = { ...INITIAL_STATE };
  }

  function openLeaveConfirm(): void {
    state.value = { ...state.value, showLeaveConfirm: true };
  }

  function closeLeaveConfirm(): void {
    state.value = { ...state.value, showLeaveConfirm: false };
  }

  return {
    state, loading, error, selectClass, chooseDoor, castSpell, buyItem, forfeitRun, resetRun,
    openLeaveConfirm, closeLeaveConfirm, attackEnemy, usePotion, closeMerchant, resolveEvent, selectTarget,
  };
});

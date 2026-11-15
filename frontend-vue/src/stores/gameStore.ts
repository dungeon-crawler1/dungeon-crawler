// =============================================================================
// STORE DEL MOTOR DE JUEGO EN VUE (PARIDAD CON EL HOOK DE REACT)
// =============================================================================
import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Door, GameState, HeroClassId, ShopItem, SpellId } from '../types/game';
import { startGameRun, syncRunTurn } from '../services/gameService';
import { applyShopPurchase, consumeInventoryPotion } from '../utils/combatLogic';
import { applyEventEffect, resolveDoorEncounter } from '../utils/roomLogic';
import {
  advanceRoom, appendLogs, buildRunStats, castSpell as castSpellTurn, firstTarget,
  performAttack, recordRunEnd, usePotionTurn,
} from '../../../shared/game/turnLogic';

const INITIAL_STATE: GameState = {
  runId: null, hero: null, currentRoom: 1, score: 0, inCombat: false, enemy: null, enemies: [],
  targetIndex: 0, availableDoors: [], merchantItems: [], isLuxuryMerchant: false, currentEvent: null,
  logs: [], isFinished: false, finishReason: null, showLeaveConfirm: false,
};

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState>({ ...INITIAL_STATE });
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function withStats(next: GameState, patch: Partial<NonNullable<GameState['stats']>>): GameState {
    const stats = buildRunStats(next);
    return { ...next, stats: { ...stats, ...patch } };
  }

  function sync(snapshot: GameState, payload: Record<string, unknown>): Promise<void> {
    return snapshot.runId ? syncRunTurn(snapshot.runId, { ...payload, estado_run: buildRunStats(snapshot) }) : Promise.resolve();
  }

  async function selectClass(classId: HeroClassId): Promise<void> {
    loading.value = true;
    error.value = null;
    try { state.value = await startGameRun(classId); }
    catch (err) { error.value = err instanceof Error ? err.message : 'Error al iniciar la partida'; }
    finally { loading.value = false; }
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

  async function settle(outcome: ReturnType<typeof performAttack>): Promise<void> {
    const updated = withStats(outcome.state, {
      dano_infligido: (outcome.state.stats?.dano_infligido ?? 0) + (outcome.damageDealt ?? 0),
      dano_recibido: (outcome.state.stats?.dano_recibido ?? 0) + (outcome.damageTaken ?? 0),
      monedas_obtenidas: (outcome.state.stats?.monedas_obtenidas ?? 0) + (outcome.goldEarned ?? 0),
    });
    if (outcome.heroDead) {
      state.value = updated;
      await sync(updated, { puntuacion: updated.score, vida: 0, monedas: updated.hero?.gold ?? 0, resultado: 'DERROTA', evento: 'Derrota' });
      return;
    }
    if (outcome.allDead) {
      const advanced = advanceRoom(updated, 'Sala superada.');
      const withLog = { ...advanced, logs: appendLogs(advanced, [`¡Sala superada! Puntuación: ${advanced.score}.`]) };
      state.value = withLog;
      await sync(withLog, { puntuacion: withLog.score, vida: withLog.hero?.hp ?? 0, monedas: withLog.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: 'Sala superada' });
      return;
    }
    state.value = updated;
  }

  async function attackEnemy(): Promise<void> { await settle(performAttack(state.value)); }
  async function castSpell(spell: SpellId): Promise<void> { await settle(castSpellTurn(state.value, spell)); }
  function usePotion(potionId: string): void { state.value = usePotionTurn(state.value, potionId, consumeInventoryPotion).state; }

  function selectTarget(index: number): void {
    const target = state.value.enemies?.[index];
    if (target && target.hp > 0) state.value = { ...state.value, targetIndex: index, enemy: target };
  }

  function buyItem(item: ShopItem): void {
    const hero = state.value.hero;
    if (!hero || hero.gold < item.price) return;
    const stock = item.type === 'RELIQUIA' ? state.value.merchantItems.filter((i) => i.id !== item.id) : state.value.merchantItems;
    const note = item.type === 'POCION' ? 'guardada en inventario' : `equipada (${item.effectSummary})`;
    const next = withStats({ ...state.value, hero: applyShopPurchase(hero, item), merchantItems: stock }, { monedas_gastadas: (state.value.stats?.monedas_gastadas ?? 0) + item.price });
    state.value = { ...next, logs: appendLogs(next, [`Compraste [${item.name}] (${note}, -${item.price} monedas).`]) };
  }

  async function resolveEvent(option: string): Promise<void> {
    const hero = state.value.hero;
    const event = state.value.currentEvent;
    if (!hero || !event) return;
    const result = applyEventEffect(hero, event, option === 'ACCEPT');
    const delta = result.hero.gold - hero.gold;
    const next = withStats({ ...state.value, hero: result.hero }, {
      monedas_obtenidas: (state.value.stats?.monedas_obtenidas ?? 0) + Math.max(0, delta),
      monedas_gastadas: (state.value.stats?.monedas_gastadas ?? 0) + Math.max(0, -delta),
    });
    const advanced = advanceRoom({ ...next, logs: appendLogs(next, [result.message]) }, result.message);
    state.value = advanced;
    await sync(advanced, { puntuacion: advanced.score, vida: advanced.hero?.hp ?? 0, monedas: advanced.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: result.message });
  }

  async function closeMerchant(): Promise<void> {
    if (!state.value.hero) return;
    const advanced = advanceRoom(state.value, 'Saliste de la tienda.');
    state.value = { ...advanced, logs: appendLogs(advanced, ['Saliste de la tienda.']) };
    await sync(advanced, { puntuacion: advanced.score, vida: advanced.hero?.hp ?? 0, monedas: advanced.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: 'Mercader' });
  }

  async function forfeitRun(): Promise<void> {
    const ended = recordRunEnd({ ...state.value, isFinished: true, finishReason: 'VICTORIA_RETIRO' }, 'RETIRO', 'Retiro voluntario');
    state.value = ended;
    if (ended.hero) await sync(ended, { puntuacion: ended.score, vida: ended.hero.hp, monedas: ended.hero.gold, resultado: 'FINALIZADA', evento: 'Retiro voluntario' });
  }

  function resetRun(): void { state.value = { ...INITIAL_STATE }; }
  function openLeaveConfirm(): void { state.value = { ...state.value, showLeaveConfirm: true }; }
  function closeLeaveConfirm(): void { state.value = { ...state.value, showLeaveConfirm: false }; }

  return {
    state, loading, error, selectClass, chooseDoor, castSpell, buyItem, forfeitRun, resetRun,
    openLeaveConfirm, closeLeaveConfirm, attackEnemy, usePotion, closeMerchant, resolveEvent, selectTarget,
  };
});

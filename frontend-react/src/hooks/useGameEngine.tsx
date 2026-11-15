// =============================================================================
// HOOK ORQUESTADOR DEL MOTOR DE JUEGO (< 150 LÍNEAS)
// =============================================================================
import { useState } from 'react';
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

function withStats(state: GameState, patch: Partial<NonNullable<GameState['stats']>>): GameState {
  const stats = buildRunStats(state);
  return { ...state, stats: { ...stats, ...patch } };
}

export function useGameEngine() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sync = (snapshot: GameState, payload: Record<string, unknown>) =>
    snapshot.runId ? syncRunTurn(snapshot.runId, { ...payload, estado_run: buildRunStats(snapshot) }) : Promise.resolve();

  const selectClass = async (classId: HeroClassId) => {
    setLoading(true);
    setError(null);
    try { setState(await startGameRun(classId)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al iniciar la partida'); }
    finally { setLoading(false); }
  };

  const chooseDoor = (door: Door) => {
    if (!state.hero) return;
    const encounter = resolveDoorEncounter(door, state.hero, state.score);
    setState({
      ...state, inCombat: encounter.inCombat, enemy: encounter.enemy, enemies: encounter.enemies,
      targetIndex: firstTarget(encounter.enemies), merchantItems: encounter.merchantItems,
      isLuxuryMerchant: encounter.isLuxuryMerchant, currentEvent: encounter.currentEvent,
      logs: appendLogs(state, [encounter.log]),
    });
  };

  const settle = async (outcome: ReturnType<typeof performAttack>) => {
    const updated = withStats(outcome.state, {
      dano_infligido: (outcome.state.stats?.dano_infligido ?? 0) + (outcome.damageDealt ?? 0),
      dano_recibido: (outcome.state.stats?.dano_recibido ?? 0) + (outcome.damageTaken ?? 0),
      monedas_obtenidas: (outcome.state.stats?.monedas_obtenidas ?? 0) + (outcome.goldEarned ?? 0),
    });
    if (outcome.heroDead) {
      setState(updated);
      await sync(updated, { puntuacion: updated.score, vida: 0, monedas: updated.hero?.gold ?? 0, resultado: 'DERROTA', evento: 'Derrota' });
      return;
    }
    if (outcome.allDead) {
      const advanced = advanceRoom(updated, 'Sala superada.');
      const withLog = { ...advanced, logs: appendLogs(advanced, [`¡Sala superada! Puntuación: ${advanced.score}.`]) };
      setState(withLog);
      await sync(withLog, { puntuacion: withLog.score, vida: withLog.hero?.hp ?? 0, monedas: withLog.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: 'Sala superada' });
      return;
    }
    setState(updated);
  };

  const attackEnemy = async () => settle(performAttack(state));
  const castSpell = async (spell: SpellId) => settle(castSpellTurn(state, spell));
  const usePotion = (potionId: string) => setState(usePotionTurn(state, potionId, consumeInventoryPotion).state);

  const selectTarget = (index: number) => {
    if (state.enemies && state.enemies[index]?.hp > 0) setState({ ...state, targetIndex: index, enemy: state.enemies[index] });
  };

  const buyItem = (item: ShopItem) => {
    if (!state.hero || state.hero.gold < item.price) return;
    const stock = item.type === 'RELIQUIA' ? state.merchantItems.filter((i) => i.id !== item.id) : state.merchantItems;
    const note = item.type === 'POCION' ? 'guardada en inventario' : `equipada (${item.effectSummary})`;
    const next = withStats({ ...state, hero: applyShopPurchase(state.hero, item), merchantItems: stock }, { monedas_gastadas: (state.stats?.monedas_gastadas ?? 0) + item.price });
    setState({ ...next, logs: appendLogs(next, [`Compraste [${item.name}] (${note}, -${item.price} monedas).`]) });
  };

  const resolveEvent = async (option: string) => {
    if (!state.hero || !state.currentEvent) return;
    const result = applyEventEffect(state.hero, state.currentEvent, option === 'ACCEPT');
    const delta = result.hero.gold - state.hero.gold;
    const next = withStats({ ...state, hero: result.hero }, {
      monedas_obtenidas: (state.stats?.monedas_obtenidas ?? 0) + Math.max(0, delta),
      monedas_gastadas: (state.stats?.monedas_gastadas ?? 0) + Math.max(0, -delta),
    });
    const advanced = advanceRoom({ ...next, logs: appendLogs(next, [result.message]) }, result.message);
    setState(advanced);
    await sync(advanced, { puntuacion: advanced.score, vida: advanced.hero?.hp ?? 0, monedas: advanced.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: result.message });
  };

  const closeMerchant = async () => {
    if (!state.hero) return;
    const advanced = advanceRoom(state, 'Saliste de la tienda.');
    setState({ ...advanced, logs: appendLogs(advanced, ['Saliste de la tienda.']) });
    await sync(advanced, { puntuacion: advanced.score, vida: advanced.hero?.hp ?? 0, monedas: advanced.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: 'Mercader' });
  };

  const forfeitRun = async () => {
    const ended = recordRunEnd({ ...state, isFinished: true, finishReason: 'VICTORIA_RETIRO' }, 'RETIRO', 'Retiro voluntario');
    setState(ended);
    if (ended.hero) await sync(ended, { puntuacion: ended.score, vida: ended.hero.hp, monedas: ended.hero.gold, resultado: 'FINALIZADA', evento: 'Retiro voluntario' });
  };

  const resetRun = () => setState(INITIAL_STATE);
  const openLeaveConfirm = () => setState((prev) => ({ ...prev, showLeaveConfirm: true }));
  const closeLeaveConfirm = () => setState((prev) => ({ ...prev, showLeaveConfirm: false }));

  return {
    state, loading, error, selectClass, chooseDoor, castSpell, buyItem, forfeitRun, resetRun,
    openLeaveConfirm, closeLeaveConfirm, attackEnemy, usePotion, closeMerchant, resolveEvent, selectTarget,
  };
}

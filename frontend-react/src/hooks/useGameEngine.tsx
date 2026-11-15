// =============================================================================
// HOOK ORQUESTADOR DEL MOTOR DE JUEGO (< 150 LÍNEAS)
// =============================================================================
import { useState } from 'react';
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

export function useGameEngine() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sync = (payload: Record<string, unknown>) => (state.runId ? syncRunTurn(state.runId, payload) : Promise.resolve());

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
    setState((prev) => ({
      ...prev, inCombat: encounter.inCombat, enemy: encounter.enemy, enemies: encounter.enemies,
      targetIndex: firstTarget(encounter.enemies), merchantItems: encounter.merchantItems,
      isLuxuryMerchant: encounter.isLuxuryMerchant, currentEvent: encounter.currentEvent,
      logs: appendLogs(prev, [encounter.log]),
    }));
  };

  const settle = async (next: GameState, allDead: boolean, heroDead: boolean) => {
    if (heroDead) {
      setState(next);
      await sync({ puntuacion: next.score, vida: 0, monedas: next.hero?.gold ?? 0, resultado: 'DERROTA', evento: 'Derrota' });
      return;
    }
    if (allDead) {
      const advanced = advanceRoom(next);
      const withLog = { ...advanced, logs: appendLogs(advanced, [`¡Sala superada! Puntuación: ${advanced.score}.`]) };
      setState(withLog);
      await sync({ puntuacion: withLog.score, vida: withLog.hero?.hp ?? 0, monedas: withLog.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: 'Sala superada' });
      return;
    }
    setState(next);
  };

  const attackEnemy = async () => {
    const outcome = performAttack(state);
    await settle(outcome.state, outcome.allDead, outcome.heroDead);
  };

  const castSpell = async (spell: SpellId) => {
    const outcome = castSpellTurn(state, spell);
    await settle(outcome.state, outcome.allDead, outcome.heroDead);
  };

  const usePotion = (potionId: string) => {
    const outcome = usePotionTurn(state, potionId, consumeInventoryPotion);
    setState(outcome.state);
  };

  const selectTarget = (index: number) => {
    if (state.enemies && state.enemies[index]?.hp > 0) setState({ ...state, targetIndex: index, enemy: state.enemies[index] });
  };

  const buyItem = (item: ShopItem) => {
    if (!state.hero || state.hero.gold < item.price) return;
    const stock = item.type === 'RELIQUIA' ? state.merchantItems.filter((i) => i.id !== item.id) : state.merchantItems;
    const note = item.type === 'POCION' ? 'guardada en inventario' : `equipada (${item.effectSummary})`;
    setState({ ...state, hero: applyShopPurchase(state.hero, item), merchantItems: stock, logs: appendLogs(state, [`Compraste [${item.name}] (${note}, -${item.price} monedas).`]) });
  };

  const resolveEvent = async (option: string) => {
    if (!state.hero || !state.currentEvent) return;
    const result = applyEventEffect(state.hero, state.currentEvent, option === 'ACCEPT');
    const advanced = advanceRoom({ ...state, hero: result.hero, currentEvent: null, logs: appendLogs(state, [result.message]) });
    setState(advanced);
    await sync({ puntuacion: advanced.score, vida: advanced.hero?.hp ?? 0, monedas: advanced.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: result.message });
  };

  const closeMerchant = async () => {
    if (!state.hero) return;
    const advanced = advanceRoom(state);
    setState({ ...advanced, logs: appendLogs(advanced, ['Saliste de la tienda.']) });
    await sync({ puntuacion: advanced.score, vida: advanced.hero?.hp ?? 0, monedas: advanced.hero?.gold ?? 0, resultado: 'EN_PROGRESO', evento: 'Mercader' });
  };

  const forfeitRun = async () => {
    setState((prev) => ({ ...prev, isFinished: true, finishReason: 'VICTORIA_RETIRO' }));
    if (state.hero) await sync({ puntuacion: state.score, vida: state.hero.hp, monedas: state.hero.gold, resultado: 'FINALIZADA', evento: 'Retiro voluntario' });
  };

  const resetRun = () => setState(INITIAL_STATE);
  const openLeaveConfirm = () => setState((prev) => ({ ...prev, showLeaveConfirm: true }));
  const closeLeaveConfirm = () => setState((prev) => ({ ...prev, showLeaveConfirm: false }));

  return {
    state, loading, error, selectClass, chooseDoor, castSpell, buyItem, forfeitRun, resetRun,
    openLeaveConfirm, closeLeaveConfirm, attackEnemy, usePotion, closeMerchant, resolveEvent, selectTarget,
  };
}

// =============================================================================
// HOOK ORQUESTADOR DEL MOTOR DE JUEGO POR TURNOS (< 150 LÍNEAS TOTALES)
// =============================================================================
import { useState } from 'react';
import type { Door, GameState, Hero, HeroClassId, ShopItem, SpellId } from '../types/game';
import { EMPTY_BATTLE_BUFFS, generateProceduralDoors, startGameRun, syncRunTurn } from '../services/gameService';
import { applyShopPurchase, applyVictoryRewards, calculateEnemyCounterAttack, calculateHeroPhysicalDamage, calculateSpellDamage, consumeInventoryPotion } from '../utils/combatLogic';
import { applyEventEffect, resolveDoorEncounter } from '../utils/roomLogic';

const INITIAL_STATE: GameState = {
  runId: null, hero: null, currentRoom: 1, score: 0, inCombat: false, enemy: null,
  availableDoors: [], merchantItems: [], isLuxuryMerchant: false, currentEvent: null,
  logs: [], isFinished: false, finishReason: null, showLeaveConfirm: false,
};

export function useGameEngine() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const appendLog = (msg: string, prevLogs: string[]) => [`[Sala #${state.currentRoom}] ${msg}`, ...prevLogs.slice(0, 11)];

  const selectClass = async (classId: HeroClassId) => {
    setLoading(true);
    setError(null);
    try { setState(await startGameRun(classId)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al iniciar la partida'); }
    finally { setLoading(false); }
  };

  // Completa la sala actual, limpia buffs de combate y suma +1 punto
  const completeRoom = async (nextHero: Hero, logMsg: string) => {
    const nextScore = state.score + 1;
    const cleanHero: Hero = { ...nextHero, shieldCharges: 0, battleBuffs: { ...EMPTY_BATTLE_BUFFS } };
    const summary = `${logMsg} | Avanzas a Sala #${nextScore + 1} (Puntuación: ${nextScore}).`;
    setState((prev) => ({
      ...prev, hero: cleanHero, score: nextScore, currentRoom: nextScore + 1,
      inCombat: false, enemy: null, merchantItems: [], currentEvent: null,
      availableDoors: generateProceduralDoors(nextScore, cleanHero.defeatedBosses),
      logs: appendLog(summary, prev.logs),
    }));
    if (state.runId) await syncRunTurn(state.runId, { puntuacion: nextScore, vida: cleanHero.hp, monedas: cleanHero.gold, resultado: 'EN_PROGRESO', evento: summary });
  };

  const resolveCombatStep = async (damageToEnemy: number, manaCost: number, label: string) => {
    if (!state.hero || !state.enemy) return;
    const remainingEnemyHp = Math.max(0, state.enemy.hp - damageToEnemy);
    const updatedMana = Math.max(0, state.hero.mana - manaCost);

    if (remainingEnemyHp === 0) {
      const { hero: victor, earnedGold } = applyVictoryRewards(state.hero, state.enemy, updatedMana);
      const relicNote = state.enemy.bossRelic ? ` y obtuviste [${state.enemy.bossRelic.name}]` : '';
      await completeRoom(victor, `¡Venciste a ${state.enemy.name}! (+${earnedGold} monedas${relicNote})`);
      return;
    }

    const counter = calculateEnemyCounterAttack(state.hero, state.enemy);
    const nextHp = Math.max(0, state.hero.hp - counter.damageTaken);
    const nextHero: Hero = { ...state.hero, hp: nextHp, mana: updatedMana, shieldCharges: counter.remainingSpellShields, battleBuffs: { ...state.hero.battleBuffs, blockCharges: counter.remainingPotionBlocks } };

    if (nextHp === 0) {
      setState((prev) => ({ ...prev, hero: nextHero, inCombat: false, isFinished: true, finishReason: 'DERROTA', logs: appendLog(`Caíste ante ${state.enemy!.name}.`, prev.logs) }));
      if (state.runId) await syncRunTurn(state.runId, { puntuacion: state.score, vida: 0, monedas: nextHero.gold, resultado: 'DERROTA', evento: 'Derrota' });
      return;
    }

    setState((prev) => ({ ...prev, hero: nextHero, enemy: { ...prev.enemy!, hp: remainingEnemyHp }, logs: appendLog(`${label}: -${damageToEnemy} HP al enemigo. Recibes ${counter.damageTaken} de daño${counter.note}.`, prev.logs) }));
  };

  const castSpell = async (spell: SpellId) => {
    if (!state.hero || !state.enemy) return;
    if (spell === 'ESCAPE') {
      setState((prev) => ({ ...prev, hero: { ...prev.hero!, mana: prev.hero!.mana - 60, shieldCharges: 0, battleBuffs: { ...EMPTY_BATTLE_BUFFS } }, inCombat: false, enemy: null, availableDoors: generateProceduralDoors(prev.score, prev.hero!.defeatedBosses), logs: appendLog('Escape Arcano (-60 Maná): vuelves a elegir puerta.', prev.logs) }));
      return;
    }
    if (spell === 'ESCUDO') {
      setState((prev) => ({ ...prev, hero: { ...prev.hero!, mana: prev.hero!.mana - 40, shieldCharges: 2 }, logs: appendLog('Escudo Arcano (-40 Maná): bloquearás los próximos 2 ataques.', prev.logs) }));
      return;
    }
    await resolveCombatStep(calculateSpellDamage(state.hero, spell), spell === 'RAYO' ? 55 : 30, `Hechizo ${spell}`);
  };

  const chooseDoor = (door: Door) => {
    if (!state.hero) return;
    const enc = resolveDoorEncounter(door, state.hero, state.score);
    setState((prev) => ({ ...prev, inCombat: enc.inCombat, enemy: enc.enemy, merchantItems: enc.merchantItems, isLuxuryMerchant: enc.isLuxuryMerchant, currentEvent: enc.currentEvent, logs: appendLog(enc.log, prev.logs) }));
  };

  const buyItem = (item: ShopItem) => {
    if (!state.hero || state.hero.gold < item.price) return;
    const stock = item.type === 'RELIQUIA' ? state.merchantItems.filter((i) => i.id !== item.id) : state.merchantItems;
    const note = item.type === 'POCION' ? 'guardada en inventario' : `equipada (${item.effectSummary})`;
    setState((prev) => ({ ...prev, hero: applyShopPurchase(prev.hero!, item), merchantItems: stock, logs: appendLog(`Compraste [${item.name}] (${note}, -${item.price} monedas).`, prev.logs) }));
  };

  const forfeitRun = async () => {
    setState((prev) => ({ ...prev, isFinished: true, finishReason: 'VICTORIA_RETIRO' }));
    if (state.runId && state.hero) await syncRunTurn(state.runId, { puntuacion: state.score, vida: state.hero.hp, monedas: state.hero.gold, resultado: 'FINALIZADA', evento: 'Retiro voluntario' });
  };

  return {
    state, loading, error, selectClass, chooseDoor, castSpell, buyItem, forfeitRun,
    resetRun: () => setState(INITIAL_STATE),
    openLeaveConfirm: () => setState((prev) => ({ ...prev, showLeaveConfirm: true })),
    closeLeaveConfirm: () => setState((prev) => ({ ...prev, showLeaveConfirm: false })),
    attackEnemy: () => state.hero && resolveCombatStep(calculateHeroPhysicalDamage(state.hero), 0, 'Ataque físico'),
    usePotion: (potionId: string) => { if (!state.hero) return; const res = consumeInventoryPotion(state.hero, potionId); setState((prev) => ({ ...prev, hero: res.hero, logs: appendLog(res.message, prev.logs) })); },
    closeMerchant: () => completeRoom(state.hero!, 'Saliste de la tienda.'),
    resolveEvent: (opt: string) => { if (!state.hero || !state.currentEvent) return; const out = applyEventEffect(state.hero, state.currentEvent, opt === 'ACCEPT'); completeRoom(out.hero, out.message); },
  };
}
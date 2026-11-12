// =============================================================================
// HOOK DE ESTADO DEL MOTOR DE JUEGO POR TURNOS
// =============================================================================
import { useState } from 'react';
import type { Door, GameState, Hero, HeroClassId, ShopItem, SpellId } from '../types/game';
import { generateProceduralDoors, spawnEnemyForRoom, startGameRun, syncRunTurn } from '../services/gameService';
import {
  applyEventEffect,
  calculateEnemyCounterAttack,
  calculateGoldReward,
  calculateHeroPhysicalDamage,
  MERCHANT_CATALOG,
} from '../utils/combatLogic';

const INITIAL_STATE: GameState = {
  runId: null, hero: null, currentRoom: 1, score: 0, inCombat: false,
  enemy: null, availableDoors: [], merchantItems: [], currentEvent: null,
  logs: [], isFinished: false, finishReason: null,
};

export function useGameEngine() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectClass = async (classId: HeroClassId) => {
    setLoading(true);
    setError(null);
    try {
      setState(await startGameRun(classId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar la partida');
    } finally {
      setLoading(false);
    }
  };

  // Avanza a la siguiente habitación sumando +1 punto y generando 2-3 puertas nuevas
  const completeRoom = async (nextHero: Hero, logMsg: string) => {
    const nextScore = state.score + 1;
    setState((prev) => ({
      ...prev, hero: nextHero, score: nextScore, currentRoom: nextScore + 1,
      inCombat: false, enemy: null, merchantItems: [], currentEvent: null,
      availableDoors: generateProceduralDoors(nextScore),
      logs: [logMsg, ...prev.logs.slice(0, 5)],
    }));
    if (state.runId) {
      await syncRunTurn(state.runId, { puntuacion: nextScore, vida: nextHero.hp, monedas: nextHero.gold, resultado: 'EN_PROGRESO', evento: logMsg });
    }
  };

  // Procesa un intercambio de turno en combate hasta que uno de los dos caiga
  const resolveCombatStep = async (damageToEnemy: number, manaCost: number, label: string) => {
    if (!state.hero || !state.enemy) return;
    const remainingEnemyHp = Math.max(0, state.enemy.hp - damageToEnemy);
    const updatedMana = Math.max(0, state.hero.mana - manaCost);

    if (remainingEnemyHp === 0) {
      const earnedGold = calculateGoldReward(state.hero, state.enemy);
      const victor = { ...state.hero, mana: updatedMana, gold: state.hero.gold + earnedGold };
      await completeRoom(victor, `Derrotaste a ${state.enemy.name} (+${earnedGold} monedas, +1 punto).`);
      return;
    }

    const counter = calculateEnemyCounterAttack(state.hero, state.enemy);
    const nextHp = Math.max(0, state.hero.hp - counter.damageTaken);
    const nextHero = { ...state.hero, hp: nextHp, mana: updatedMana, shieldCharges: counter.remainingShields };

    if (nextHp === 0) {
      setState((prev) => ({ ...prev, hero: nextHero, inCombat: false, isFinished: true, finishReason: 'DERROTA' }));
      if (state.runId) await syncRunTurn(state.runId, { puntuacion: state.score, vida: 0, monedas: nextHero.gold, resultado: 'DERROTA', evento: 'Derrota en combate' });
      return;
    }

    setState((prev) => ({
      ...prev, hero: nextHero, enemy: { ...prev.enemy!, hp: remainingEnemyHp },
      logs: [`${label}: -${damageToEnemy} HP al enemigo. Recibes ${counter.damageTaken} de daño${counter.note}.`, ...prev.logs.slice(0, 5)],
    }));
  };

  const castSpell = async (spell: SpellId) => {
    if (!state.hero || !state.enemy) return;
    if (spell === 'ESCAPE') {
      setState((prev) => ({
        ...prev, hero: { ...prev.hero!, mana: prev.hero!.mana - 60 }, inCombat: false, enemy: null,
        availableDoors: generateProceduralDoors(prev.score),
        logs: ['Escape Arcano: regresas a elegir camino sin perder puntuación.', ...prev.logs.slice(0, 5)],
      }));
      return;
    }
    if (spell === 'ESCUDO') {
      setState((prev) => ({
        ...prev, hero: { ...prev.hero!, mana: prev.hero!.mana - 40, shieldCharges: 2 },
        logs: ['Escudo Arcano activo (2 bloqueos).', ...prev.logs.slice(0, 5)],
      }));
      return;
    }
    const dmg = spell === 'RAYO' ? Math.round(state.hero.attack * 1.6) : Math.round(state.hero.attack * 1.15);
    await resolveCombatStep(dmg, spell === 'RAYO' ? 55 : 30, `Hechizo ${spell}`);
  };

  const chooseDoor = (door: Door) => {
    const type = door.type === 'MYSTERY' ? 'TREASURE' : door.type;
    if (type === 'COMBAT' || type === 'ELITE' || type === 'BOSS') {
      const enemy = spawnEnemyForRoom(type);
      setState((prev) => ({ ...prev, inCombat: true, enemy, logs: [`Entraste a ${door.title}: aparece ${enemy.name}.`, ...prev.logs.slice(0, 5)] }));
      return;
    }
    if (type === 'MERCHANT') {
      setState((prev) => ({ ...prev, merchantItems: MERCHANT_CATALOG }));
      return;
    }
    setState((prev) => ({ ...prev, currentEvent: { title: door.title, description: door.description, type } }));
  };

  const buyItem = (item: ShopItem) => {
    if (!state.hero || state.hero.gold < item.price) return;
    setState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero!, gold: prev.hero!.gold - item.price,
        hp: Math.min(prev.hero!.maxHp, prev.hero!.hp + item.hpRestore),
        attack: prev.hero!.attack + item.attackBonus,
        relics: item.type === 'RELIQUIA' ? [...prev.hero!.relics, item.name] : prev.hero!.relics,
      },
      logs: [`Compraste ${item.name} (-${item.price} monedas).`, ...prev.logs.slice(0, 5)],
    }));
  };

  const forfeitRun = async () => {
    setState((prev) => ({ ...prev, isFinished: true, finishReason: 'VICTORIA_RETIRO' }));
    if (state.runId && state.hero) {
      await syncRunTurn(state.runId, { puntuacion: state.score, vida: state.hero.hp, monedas: state.hero.gold, resultado: 'FINALIZADA', evento: 'Retiro voluntario' });
    }
  };

  return {
    state, loading, error, selectClass, chooseDoor,
    attackEnemy: () => state.hero && resolveCombatStep(calculateHeroPhysicalDamage(state.hero), 0, 'Ataque físico'),
    usePotion: () => {
      if (!state.hero || state.hero.potions <= 0) return;
      setState((prev) => ({ ...prev, hero: { ...prev.hero!, potions: prev.hero!.potions - 1, hp: Math.min(prev.hero!.maxHp, prev.hero!.hp + 50) }, logs: ['Pocion usada (+50 HP).', ...prev.logs.slice(0, 5)] }));
    },
    castSpell, buyItem, closeMerchant: () => completeRoom(state.hero!, 'Saliste de la tienda (+1 punto).'),
    resolveEvent: (opt: string) => state.hero && state.currentEvent && completeRoom(applyEventEffect(state.hero, state.currentEvent, opt === 'ACCEPT'), `Completaste ${state.currentEvent.title} (+1 punto).`),
    forfeitRun, resetRun: () => setState(INITIAL_STATE),
  };
}
// =============================================================================
// STORE DEL MOTOR DE JUEGO EN VUE (PARIDAD CON EL HOOK DE REACT)
// =============================================================================
import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Door, GameState, Hero, HeroClassId, ShopItem, SpellId } from '../types/game';
import { EMPTY_BATTLE_BUFFS, generateProceduralDoors, startGameRun, syncRunTurn } from '../services/gameService';
import {
  applyShopPurchase, applyVictoryRewards, calculateEnemyCounterAttack,
  calculateHeroPhysicalDamage, calculateSpellDamage, consumeInventoryPotion,
} from '../utils/combatLogic';
import { applyEventEffect, resolveDoorEncounter } from '../utils/roomLogic';

const INITIAL_STATE: GameState = {
  runId: null, hero: null, currentRoom: 1, score: 0, inCombat: false, enemy: null,
  availableDoors: [], merchantItems: [], isLuxuryMerchant: false, currentEvent: null,
  logs: [], isFinished: false, finishReason: null, showLeaveConfirm: false,
};

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState>({ ...INITIAL_STATE });
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function appendLog(msg: string, prevLogs: string[]): string[] {
    return [`[Sala #${state.value.currentRoom}] ${msg}`, ...prevLogs.slice(0, 11)];
  }

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

  async function completeRoom(nextHero: Hero, logMsg: string): Promise<void> {
    const nextScore = state.value.score + 1;
    const cleanHero: Hero = { ...nextHero, shieldCharges: 0, battleBuffs: { ...EMPTY_BATTLE_BUFFS } };
    const summary = `${logMsg} | Avanzas a Sala #${nextScore + 1} (Puntuación: ${nextScore}).`;
    state.value = {
      ...state.value, hero: cleanHero, score: nextScore, currentRoom: nextScore + 1,
      inCombat: false, enemy: null, merchantItems: [], currentEvent: null,
      availableDoors: generateProceduralDoors(nextScore, cleanHero.defeatedBosses),
      logs: appendLog(summary, state.value.logs),
    };
    await sync({ puntuacion: nextScore, vida: cleanHero.hp, monedas: cleanHero.gold, resultado: 'EN_PROGRESO', evento: summary });
  }

  async function resolveCombatStep(damageToEnemy: number, manaCost: number, label: string): Promise<void> {
    const hero = state.value.hero;
    const enemy = state.value.enemy;
    if (!hero || !enemy) return;
    const remainingEnemyHp = Math.max(0, enemy.hp - damageToEnemy);
    const updatedMana = Math.max(0, hero.mana - manaCost);
    if (remainingEnemyHp === 0) {
      const { hero: victor, earnedGold } = applyVictoryRewards(hero, enemy, updatedMana);
      const relicNote = enemy.bossRelic ? ` y obtuviste [${enemy.bossRelic.name}]` : '';
      await completeRoom(victor, `¡Venciste a ${enemy.name}! (+${earnedGold} monedas${relicNote})`);
      return;
    }
    const counter = calculateEnemyCounterAttack(hero, enemy);
    const nextHp = Math.max(0, hero.hp - counter.damageTaken);
    const nextHero: Hero = {
      ...hero, hp: nextHp, mana: updatedMana, shieldCharges: counter.remainingSpellShields,
      battleBuffs: { ...hero.battleBuffs, blockCharges: counter.remainingPotionBlocks },
    };
    if (nextHp === 0) {
      state.value = { ...state.value, hero: nextHero, inCombat: false, isFinished: true, finishReason: 'DERROTA', logs: appendLog(`Caíste ante ${enemy.name}.`, state.value.logs) };
      await sync({ puntuacion: state.value.score, vida: 0, monedas: nextHero.gold, resultado: 'DERROTA', evento: 'Derrota' });
      return;
    }
    state.value = {
      ...state.value, hero: nextHero, enemy: { ...enemy, hp: remainingEnemyHp },
      logs: appendLog(`${label}: -${damageToEnemy} HP al enemigo. Recibes ${counter.damageTaken} de daño${counter.note}.`, state.value.logs),
    };
  }

  async function castSpell(spell: SpellId): Promise<void> {
    const hero = state.value.hero;
    if (!hero || !state.value.enemy) return;
    if (spell === 'ESCAPE') {
      state.value = {
        ...state.value,
        hero: { ...hero, mana: hero.mana - 60, shieldCharges: 0, battleBuffs: { ...EMPTY_BATTLE_BUFFS } },
        inCombat: false, enemy: null,
        availableDoors: generateProceduralDoors(state.value.score, hero.defeatedBosses),
        logs: appendLog('Escape Arcano (-60 Maná): vuelves a elegir puerta.', state.value.logs),
      };
      return;
    }
    if (spell === 'ESCUDO') {
      state.value = {
        ...state.value,
        hero: { ...hero, mana: hero.mana - 40, shieldCharges: 2 },
        logs: appendLog('Escudo Arcano (-40 Maná): bloquearás los próximos 2 ataques.', state.value.logs),
      };
      return;
    }
    await resolveCombatStep(calculateSpellDamage(hero, spell), spell === 'RAYO' ? 55 : 30, `Hechizo ${spell}`);
  }

  function chooseDoor(door: Door): void {
    const hero = state.value.hero;
    if (!hero) return;
    const encounter = resolveDoorEncounter(door, hero, state.value.score);
    state.value = {
      ...state.value, inCombat: encounter.inCombat, enemy: encounter.enemy,
      merchantItems: encounter.merchantItems, isLuxuryMerchant: encounter.isLuxuryMerchant,
      currentEvent: encounter.currentEvent, logs: appendLog(encounter.log, state.value.logs),
    };
  }

  function buyItem(item: ShopItem): void {
    const hero = state.value.hero;
    if (!hero || hero.gold < item.price) return;
    const stock = item.type === 'RELIQUIA' ? state.value.merchantItems.filter((i) => i.id !== item.id) : state.value.merchantItems;
    const note = item.type === 'POCION' ? 'guardada en inventario' : `equipada (${item.effectSummary})`;
    state.value = {
      ...state.value, hero: applyShopPurchase(hero, item), merchantItems: stock,
      logs: appendLog(`Compraste [${item.name}] (${note}, -${item.price} monedas).`, state.value.logs),
    };
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

  function attackEnemy(): Promise<void> {
    const hero = state.value.hero;
    return hero ? resolveCombatStep(calculateHeroPhysicalDamage(hero), 0, 'Ataque físico') : Promise.resolve();
  }

  function usePotion(potionId: string): void {
    const hero = state.value.hero;
    if (!hero) return;
    const result = consumeInventoryPotion(hero, potionId);
    state.value = { ...state.value, hero: result.hero, logs: appendLog(result.message, state.value.logs) };
  }

  async function closeMerchant(): Promise<void> {
    const hero = state.value.hero;
    if (hero) await completeRoom(hero, 'Saliste de la tienda.');
  }

  async function resolveEvent(option: string): Promise<void> {
    const hero = state.value.hero;
    const event = state.value.currentEvent;
    if (!hero || !event) return;
    const result = applyEventEffect(hero, event, option === 'ACCEPT');
    await completeRoom(result.hero, result.message);
  }

  return {
    state, loading, error, selectClass, chooseDoor, castSpell, buyItem, forfeitRun,
    resetRun, openLeaveConfirm, closeLeaveConfirm, attackEnemy, usePotion, closeMerchant, resolveEvent,
  };
});

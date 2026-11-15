// =============================================================================
// ORQUESTACIÓN DE TURNOS COMPARTIDA POR LOS DOS FRONTENDS
// =============================================================================
import type { Enemy, GameState, Hero, SpellId } from './types';
import { heroStatuses, spellCost } from './combatLogic';
import { aliveIndex, enemyTurn, heroAttack, normalizeEnemies, skipTurn } from './combatEngine';
import { generateProceduralDoors } from './gameContent';
import { attachDoorPreviews } from './roomLogic';

export interface TurnOutcome {
  state: GameState;
  allDead: boolean;
  heroDead: boolean;
}

export function appendLogs(state: GameState, entries: string[]): string[] {
  const prefixed = entries.map((entry) => `[Sala #${state.currentRoom}] ${entry}`);
  return [...prefixed, ...state.logs].slice(0, 14);
}

function currentEnemies(state: GameState): Enemy[] {
  return normalizeEnemies(state.enemies ?? (state.enemy ? [state.enemy] : []));
}

function withEnemies(state: GameState, enemies: Enemy[]): GameState {
  const target = enemies.findIndex((enemy) => enemy.hp > 0);
  return {
    ...state,
    enemies,
    enemy: target >= 0 ? enemies[target] : null,
    targetIndex: target >= 0 ? target : 0,
  };
}

export function doorsFor(state: GameState): GameState['availableDoors'] {
  const hero = state.hero;
  if (!hero) return [];
  return attachDoorPreviews(generateProceduralDoors(state.score, hero.defeatedBosses), hero, state.score);
}

export function advanceRoom(state: GameState): GameState {
  const hero = state.hero;
  if (!hero) return state;
  const score = state.score + 1;
  return {
    ...state,
    score,
    currentRoom: score + 1,
    inCombat: false,
    enemy: null,
    enemies: [],
    targetIndex: 0,
    merchantItems: [],
    isLuxuryMerchant: false,
    currentEvent: null,
    availableDoors: attachDoorPreviews(generateProceduralDoors(score, hero.defeatedBosses), hero, score),
  };
}

function resolveEnemyPhase(state: GameState, hero: Hero, enemies: Enemy[], logs: string[]): TurnOutcome {
  const turn = enemyTurn(hero, enemies);
  const next = withEnemies({ ...state, hero: turn.hero, logs: appendLogs(state, [...logs, ...turn.logs]) }, turn.enemies);
  if (turn.heroDead) {
    return {
      state: { ...next, inCombat: false, isFinished: true, finishReason: 'DERROTA', logs: appendLogs(next, [`Caíste en la mazmorra.`]) },
      allDead: false,
      heroDead: true,
    };
  }
  return { state: next, allDead: turn.allDead, heroDead: false };
}

export function performAttack(state: GameState, spell?: 'BOLA_FUEGO' | 'RAYO'): TurnOutcome {
  const hero = state.hero;
  const enemies = currentEnemies(state);
  if (!hero || enemies.length === 0) return { state, allDead: false, heroDead: false };

  if (heroStatuses(hero).stunTurns > 0) {
    const skipped = skipTurn(hero, enemies);
    const next = withEnemies({ ...state, hero: skipped.hero, logs: appendLogs(state, ['😵 Estás aturdido: perdés el ataque.', ...skipped.logs]) }, skipped.enemies);
    return { state: next, allDead: skipped.allDead, heroDead: skipped.heroDead };
  }

  const hit = heroAttack(hero, enemies, state.targetIndex ?? 0, spell);
  const next = withEnemies({ ...state, hero: hit.hero, logs: appendLogs(state, hit.logs) }, hit.enemies);
  if (hit.allDead) return { state: next, allDead: true, heroDead: false };
  return resolveEnemyPhase(next, hit.hero, hit.enemies, []);
}

function utilitySpell(hero: Hero, spell: SpellId, cost: number): { hero: Hero; log: string } | null {
  if (spell === 'ESCUDO') return { hero: { ...hero, mana: hero.mana - cost, shieldCharges: 2 }, log: '🛡️ Escudo Arcano: inmunidad a los próximos 2 ataques.' };
  if (spell === 'EVASION') return { hero: { ...hero, mana: hero.mana - cost, statuses: { ...heroStatuses(hero), evasionTurns: 3 } }, log: '💨 Evasión: +40 % por 3 turnos.' };
  if (spell === 'FUERZA') return { hero: { ...hero, mana: hero.mana - cost, statuses: { ...heroStatuses(hero), strengthTurns: 5 } }, log: '💪 Fuerza: +30 % de daño por 5 turnos.' };
  return null;
}

export function castSpell(state: GameState, spell: SpellId): TurnOutcome {
  const hero = state.hero;
  const enemies = currentEnemies(state);
  if (!hero) return { state, allDead: false, heroDead: false };
  const cost = spellCost(hero, spell);
  if (hero.mana < cost) return { state: { ...state, logs: appendLogs(state, ['No tenés maná suficiente.']) }, allDead: false, heroDead: false };

  if (spell === 'ESCAPE') {
    const mana = hero.mana - cost;
    const escaped = withEnemies({ ...state, hero: { ...hero, mana }, inCombat: false, logs: appendLogs(state, ['🌀 Escape Arcano: volvés a elegir puerta.']) }, []);
    return { state: { ...escaped, availableDoors: doorsFor({ ...escaped, score: state.score }) }, allDead: false, heroDead: false };
  }

  const utility = utilitySpell(hero, spell, cost);
  if (utility) {
    const next = { ...state, hero: utility.hero, logs: appendLogs(state, [utility.log]) };
    return resolveEnemyPhase(next, utility.hero, enemies, []);
  }
  if (spell === 'BOLA_FUEGO' || spell === 'RAYO') return performAttack({ ...state, hero: { ...hero, mana: hero.mana - cost } }, spell);
  return { state, allDead: false, heroDead: false };
}

export function usePotionTurn(state: GameState, potionId: string, consume: (hero: Hero, id: string) => { hero: Hero; message: string; escaped?: boolean }): TurnOutcome {
  const hero = state.hero;
  if (!hero) return { state, allDead: false, heroDead: false };
  const result = consume(hero, potionId);
  const next = { ...state, hero: result.hero, logs: appendLogs(state, [result.message]) };
  if (result.escaped) {
    return { state: { ...withEnemies(next, []), inCombat: false, availableDoors: doorsFor(next) }, allDead: false, heroDead: false };
  }
  return { state: next, allDead: false, heroDead: false };
}

export function firstTarget(enemies: Enemy[]): number {
  const index = aliveIndex(enemies);
  return index < 0 ? 0 : index;
}

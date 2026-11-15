// =============================================================================
// MOTOR DE COMBATE COMPARTIDO: TURNOS, GRUPOS, ESTADOS Y HABILIDADES ESPECIALES
// =============================================================================
import type { Enemy, EnemyStatuses, Hero, HeroStatuses } from './types';
import { applyVictoryRewards, calculateHeroPhysicalDamage, calculateSpellDamage, heroStatuses } from './combatLogic';

export interface BattleResult {
  hero: Hero;
  enemies: Enemy[];
  logs: string[];
  allDead: boolean;
  heroDead: boolean;
}

const EMPTY_ENEMY_STATUSES: EnemyStatuses = { stunTurns: 0, acidTurns: 0, burnTurns: 0 };

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function normalizeEnemy(enemy: Enemy): Enemy {
  return { ...enemy, statuses: enemy.statuses ?? { ...EMPTY_ENEMY_STATUSES }, id: enemy.id ?? `${enemy.name}-${Math.random().toString(36).slice(2, 6)}` };
}

export function normalizeEnemies(enemies: Enemy[]): Enemy[] {
  return enemies.map(normalizeEnemy);
}

export function aliveIndex(enemies: Enemy[]): number {
  return enemies.findIndex((enemy) => enemy.hp > 0);
}

function heroHasRelic(hero: Hero, id: string): boolean {
  return hero.relics.some((relic) => relic.id === id);
}

function allDead(enemies: Enemy[]): boolean {
  return enemies.every((enemy) => enemy.hp <= 0);
}

function defend(hero: Hero, rawDamage: number): { hero: Hero; damage: number; note: string } {
  const statuses = heroStatuses(hero);
  if (hero.battleBuffs.blockCharges > 0) {
    return { hero: { ...hero, battleBuffs: { ...hero.battleBuffs, blockCharges: hero.battleBuffs.blockCharges - 1 } }, damage: 0, note: ' (bloqueado por Poción)' };
  }
  if (hero.shieldCharges > 0) {
    return { hero: { ...hero, shieldCharges: hero.shieldCharges - 1 }, damage: 0, note: ' (bloqueado por Escudo Arcano)' };
  }
  if (hero.heroClass === 'CABALLERO' && Math.random() < 0.2) return { hero, damage: 0, note: ' (bloqueado con escudo)' };
  const evasion = hero.evasionChance + hero.battleBuffs.evasionBonus + (statuses.evasionTurns > 0 ? 0.4 : 0);
  if (evasion > 0 && Math.random() < evasion) return { hero, damage: 0, note: ' (esquivado)' };
  const reduction = Math.min(0.85, hero.damageReduction + hero.battleBuffs.defenseBonus);
  return { hero, damage: Math.max(1, Math.round(rawDamage * (1 - reduction))), note: '' };
}

function hitEnemy(enemy: Enemy, damage: number): { enemy: Enemy; dodged: boolean } {
  if (enemy.evasionChance && Math.random() < enemy.evasionChance) return { enemy, dodged: true };
  const reduction = Math.min(0.9, enemy.damageReduction ?? 0);
  return { enemy: { ...enemy, hp: Math.max(0, enemy.hp - Math.round(damage * (1 - reduction))) }, dodged: false };
}

function processKill(hero: Hero, enemy: Enemy, logs: string[]): Hero {
  let nextHero = hero;
  if (heroHasRelic(nextHero, 'boss-drac')) {
    const divisor = Math.pow(2, Math.max(0, (nextHero.turn ?? 1) - 1));
    const heal = Math.round(enemy.maxHp / divisor);
    nextHero = { ...nextHero, hp: Math.min(nextHero.maxHp, nextHero.hp + heal) };
    logs.push(`🩸 Vampirismo Completo: recuperás ${heal} HP.`);
  }
  const { hero: victor } = applyVictoryRewards(nextHero, enemy, nextHero.mana);
  logs.push(`☠️ ${enemy.name} derrotado. +${Math.round(enemy.goldReward * nextHero.goldMultiplier)} monedas.`);
  if (enemy.bossRelic) logs.push(`🏺 Obtuviste [${enemy.bossRelic.name}]: ${enemy.bossRelic.effectSummary}.`);
  return victor;
}

function settleKills(hero: Hero, enemies: Enemy[], logs: string[]): { hero: Hero; enemies: Enemy[] } {
  let nextHero = hero;
  const nextEnemies = enemies.map((enemy) => {
    if (enemy.hp <= 0 && !enemy.rewarded) {
      nextHero = processKill(nextHero, enemy, logs);
      return { ...enemy, rewarded: true };
    }
    return enemy;
  });
  return { hero: nextHero, enemies: nextEnemies };
}

function reviveIfNeeded(enemy: Enemy, logs: string[]): Enemy {
  if (enemy.ability === 'REVIVE' && !enemy.revived && enemy.hp <= 0 && Math.random() < 0.1) {
    logs.push(`💀 ${enemy.name} revive con el 35 % de su vida.`);
    return { ...enemy, revived: true, hp: Math.max(1, Math.round(enemy.maxHp * 0.35)) };
  }
  return enemy;
}

function applyRelicOnHit(hero: Hero, enemy: Enemy, logs: string[]): Enemy {
  if (heroHasRelic(hero, 'boss-shock') && Math.random() < 0.4) {
    logs.push('⚡ Dispositivo de Shock: el enemigo queda aturdido.');
    return { ...enemy, statuses: { ...(enemy.statuses ?? EMPTY_ENEMY_STATUSES), stunTurns: 1 } };
  }
  return enemy;
}

function hammerStrike(hero: Hero, enemies: Enemy[], target: number, logs: string[]): Enemy[] {
  if (!heroHasRelic(hero, 'boss-hammer') || (hero.turn ?? 1) % 3 !== 0) return enemies;
  const hits = randInt(2, 4);
  logs.push(`🔨 Mazo de Hueso: ${hits} golpes de roca (30 c/u).`);
  return enemies.map((enemy, index) => (index === target ? { ...enemy, hp: Math.max(0, enemy.hp - hits * 30) } : enemy));
}

interface AttackContext {
  enemies: Enemy[];
  index: number;
  damage: number;
  dodged: boolean;
  logs: string[];
}

function applyAttackRelics(hero: Hero, ctx: AttackContext): Enemy[] {
  let next = ctx.enemies;
  if (!ctx.dodged && heroHasRelic(hero, 'boss-emp') && Math.random() < 0.65) {
    ctx.logs.push('🗡️ Espada del Emperador: segundo golpe.');
    next[ctx.index] = hitEnemy(next[ctx.index], ctx.damage).enemy;
  }
  next = hammerStrike(hero, next, ctx.index, ctx.logs);
  next[ctx.index] = reviveIfNeeded(next[ctx.index], ctx.logs);
  next[ctx.index] = applyRelicOnHit(hero, next[ctx.index], ctx.logs);
  return next;
}

export function heroAttack(hero: Hero, enemies: Enemy[], targetIndex: number, spell?: 'BOLA_FUEGO' | 'RAYO'): BattleResult {
  const logs: string[] = [];
  const index = enemies[targetIndex]?.hp > 0 ? targetIndex : aliveIndex(enemies);
  if (index < 0) return { hero, enemies, logs, allDead: true, heroDead: false };

  const damage = spell ? calculateSpellDamage(hero, spell) : calculateHeroPhysicalDamage(hero);
  let nextEnemies = enemies.map((enemy) => ({ ...enemy }));
  const first = hitEnemy(nextEnemies[index], damage);
  nextEnemies[index] = first.enemy;
  logs.push(first.dodged ? `❌ ${enemies[index].name} esquivó el ataque.` : `⚔️ ${spell ? `Hechizo ${spell}` : 'Ataque'}: ${damage} de daño a ${enemies[index].name}.`);
  nextEnemies = applyAttackRelics(hero, { enemies: nextEnemies, index, damage, dodged: first.dodged, logs });
  const settled = settleKills(hero, nextEnemies, logs);
  return { hero: { ...settled.hero, turn: (settled.hero.turn ?? 1) + 1 }, enemies: settled.enemies, logs, allDead: allDead(settled.enemies), heroDead: false };
}

interface SpecialResult {
  hero: Hero;
  enemy: Enemy;
  damage: number;
  kind: 'NORMAL' | 'FIRE' | 'ACID' | 'CHARGE' | 'ROCKS' | 'DRAIN' | 'DOUBLE';
}

function enemySpecial(enemy: Enemy, hero: Hero, logs: string[]): SpecialResult {
  const statuses = heroStatuses(hero);
  if (enemy.ability === 'FIRE') {
    logs.push('🔥 El dragón lanza fuego: 10 % de su ataque por 5 turnos.');
    return { hero: { ...hero, statuses: { ...statuses, burnTurns: 5 }, burnDamage: Math.round(enemy.attack * 0.1) }, enemy, damage: 0, kind: 'FIRE' };
  }
  if (enemy.ability === 'ACID') {
    logs.push('🧪 La criatura escupe ácido: 15 % de su ataque por 4 turnos.');
    return { hero: { ...hero, statuses: { ...statuses, acidTurns: 4 }, acidDamage: Math.round(enemy.attack * 0.15) }, enemy, damage: 0, kind: 'ACID' };
  }
  if (enemy.ability === 'ROCKS') {
    const hits = randInt(3, 5);
    logs.push(`🪨 El titán golpea el suelo: ${hits} rocas de 50 de daño.`);
    return { hero, enemy, damage: -hits * 50, kind: 'ROCKS' };
  }
  if (enemy.ability === 'DRAIN') {
    logs.push('🩸 Drácula te drena la sangre y regenera su vida.');
    return { hero, enemy, damage: enemy.attack, kind: 'DRAIN' };
  }
  if (enemy.ability === 'DOUBLE_ATTACK' && enemy.isBoss) {
    logs.push('⚔️ El emperador avanza y ataca dos veces.');
    return { hero, enemy, damage: enemy.attack * 2, kind: 'DOUBLE' };
  }
  return { hero, enemy, damage: enemy.attack, kind: 'NORMAL' };
}

function applyEnemyHit(hero: Hero, rawDamage: number, logs: string[], name: string): { hero: Hero; dead: boolean; damage: number } {
  if (rawDamage < 0) {
    let nextHero = hero;
    let total = 0;
    const hits = Math.abs(rawDamage) / 50;
    for (let i = 0; i < hits; i += 1) {
      const result = defend(nextHero, 50);
      nextHero = { ...result.hero, hp: Math.max(0, result.hero.hp - result.damage) };
      total += result.damage;
      logs.push(`🪨 Roca: ${result.damage} de daño${result.note}.`);
      if (nextHero.hp === 0) return { hero: nextHero, dead: true, damage: total };
    }
    return { hero: nextHero, dead: false, damage: total };
  }
  const result = defend(hero, rawDamage);
  const nextHp = Math.max(0, result.hero.hp - result.damage);
  logs.push(`💥 ${name} ataca: ${result.damage} de daño${result.note}.`);
  return { hero: { ...result.hero, hp: nextHp }, dead: nextHp === 0, damage: result.damage };
}

function applyAcid(hero: Hero, enemy: Enemy, logs: string[]): Hero {
  logs.push('🧪 La criatura está furiosa: su ataque aplica ácido.');
  return { ...hero, statuses: { ...heroStatuses(hero), acidTurns: 4 }, acidDamage: Math.round(enemy.attack * 0.15) };
}

function normalAttack(enemy: Enemy, hero: Hero, logs: string[]): { hero: Hero; enemy: Enemy; heroDead: boolean } {
  let raw = enemy.attack;
  let nextEnemy = enemy;
  if (enemy.ability === 'CRITICAL' && Math.random() < 0.25) {
    raw = Math.round(raw * 1.3);
    logs.push('💢 ¡Golpe crítico!');
  }
  if (enemy.ability === 'DOUBLE_ATTACK' && !enemy.isBoss && Math.random() < 0.15) {
    raw *= 2;
    logs.push('🌳 ¡El ataque golpea dos veces!');
  }
  if (enemy.ability === 'KAMIKAZE' && Math.random() < 0.05) {
    raw = Math.round(raw * 1.5);
    logs.push('💣 ¡Ataque kamikaze!');
    nextEnemy = { ...enemy, hp: 0 };
  }
  const result = applyEnemyHit(hero, raw, logs, enemy.name);
  let nextHero = result.hero;
  if (enemy.ability === 'ACID' && enemy.hp < enemy.maxHp * 0.3) nextHero = applyAcid(nextHero, enemy, logs);
  if (enemy.ability === 'STUN' && Math.random() < (enemy.isBoss ? 0.2 : 0.15)) {
    nextHero = { ...nextHero, statuses: { ...heroStatuses(nextHero), stunTurns: 1 } };
    logs.push('😵 Quedás aturdido y perdés el próximo ataque.');
  }
  if (enemy.ability === 'REGEN') nextEnemy = { ...nextEnemy, hp: Math.min(nextEnemy.maxHp, nextEnemy.hp + Math.round(result.damage * 0.4)) };
  return { hero: nextHero, enemy: nextEnemy, heroDead: result.dead };
}

function specialAttack(enemy: Enemy, hero: Hero, logs: string[]): { hero: Hero; enemy: Enemy; heroDead: boolean } {
  if (enemy.ability === 'CHARGE') {
    if (enemy.hp < enemy.maxHp * 0.5) {
      logs.push('⚡ ¡El robot se enfurece y descarga el ataque eléctrico en el mismo turno!');
      const hit = applyEnemyHit(hero, enemy.attack * 2, logs, enemy.name);
      return { hero: hit.hero, enemy: { ...enemy, specialCooldown: 3 }, heroDead: hit.dead };
    }
    logs.push('⚡ El robot carga un ataque eléctrico para el próximo turno.');
    return { hero, enemy: { ...enemy, chargeTurns: 1, specialCooldown: 3 }, heroDead: false };
  }
  const special = enemySpecial(enemy, hero, logs);
  let nextHero = special.hero;
  let enemyAfter = special.enemy;
  let heroDead = false;
  if (special.damage !== 0) {
    const result = applyEnemyHit(nextHero, special.damage, logs, enemy.name);
    nextHero = result.hero;
    heroDead = result.dead;
    if (special.kind === 'DRAIN') enemyAfter = { ...enemyAfter, hp: Math.min(enemyAfter.maxHp, enemyAfter.hp + result.damage) };
  }
  return { hero: nextHero, enemy: enemyAfter, heroDead };
}

function enemyAction(enemy: Enemy, hero: Hero, specialChance: number, logs: string[]): { hero: Hero; enemy: Enemy; heroDead: boolean } {
  const statuses = enemy.statuses ?? EMPTY_ENEMY_STATUSES;
  const cooldown = Math.max(0, (enemy.specialCooldown ?? 0) - 1);
  const current = { ...enemy, specialCooldown: cooldown };
  if (statuses.stunTurns > 0) {
    logs.push(`😵 ${enemy.name} está aturdido y pierde el turno.`);
    return { hero, enemy: { ...current, statuses: { ...statuses, stunTurns: statuses.stunTurns - 1 } }, heroDead: false };
  }
  if (current.chargeTurns === 1) {
    const result = applyEnemyHit(hero, current.attack * 2, logs, current.name);
    return { hero: result.hero, enemy: { ...current, chargeTurns: 0, specialCooldown: 3 }, heroDead: result.dead };
  }
  if (cooldown > 0) return normalAttack(current, hero, logs);
  return Math.random() < specialChance ? specialAttack(current, hero, logs) : normalAttack(current, hero, logs);
}

function endOfTurn(hero: Hero, enemies: Enemy[], logs: string[], heroDead: boolean): BattleResult {
  const statuses = heroStatuses(hero);
  const statusDamage = (statuses.burnTurns > 0 ? hero.burnDamage ?? 0 : 0) + (statuses.acidTurns > 0 ? hero.acidDamage ?? 0 : 0);
  let nextHero = hero;
  if (statusDamage > 0) {
    logs.push(`☠️ Efectos: ${statusDamage} de daño por quemadura/ácido.`);
    nextHero = { ...nextHero, hp: Math.max(0, nextHero.hp - statusDamage) };
    heroDead = heroDead || nextHero.hp === 0;
  }
  const updated: HeroStatuses = {
    ...statuses,
    evasionTurns: Math.max(0, statuses.evasionTurns - 1),
    strengthTurns: Math.max(0, statuses.strengthTurns - 1),
    burnTurns: Math.max(0, statuses.burnTurns - 1),
    acidTurns: Math.max(0, statuses.acidTurns - 1),
  };
  const survivors = enemies.filter((enemy) => enemy.hp > 0);
  return { hero: { ...nextHero, statuses: updated }, enemies: survivors, logs, allDead: survivors.length === 0, heroDead: heroDead || nextHero.hp === 0 };
}

export function enemyTurn(hero: Hero, enemies: Enemy[]): BattleResult {
  const logs: string[] = [];
  const specialChance = enemies.some((enemy) => enemy.isBoss) ? 0.3 : 0.2;
  let nextHero = hero;
  let heroDead = false;
  const nextEnemies = enemies.map((original) => {
    if (heroDead || original.hp <= 0) return original;
    const result = enemyAction(original, nextHero, specialChance, logs);
    nextHero = result.hero;
    heroDead = result.heroDead;
    return result.enemy;
  });
  return endOfTurn(nextHero, nextEnemies, logs, heroDead);
}

export function skipTurn(hero: Hero, enemies: Enemy[]): BattleResult {
  const statuses = heroStatuses(hero);
  if (statuses.stunTurns <= 0) return { hero, enemies, logs: [], allDead: false, heroDead: false };
  const nextHero = { ...hero, statuses: { ...statuses, stunTurns: statuses.stunTurns - 1 } };
  return enemyTurn(nextHero, enemies);
}

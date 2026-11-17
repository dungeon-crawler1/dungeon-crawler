// =============================================================================
// CONTENIDO COMPARTIDO DEL JUEGO: CLASES, PUERTAS Y ENEMIGOS
// =============================================================================
import type { BattleBuffs, Door, Enemy, Hero, HeroClassId, RoomEventType } from './types';

export const EMPTY_BATTLE_BUFFS: BattleBuffs = { damageBoostPercent: 0, evasionBonus: 0, defenseBonus: 0, blockCharges: 0 };

export const CLASS_CONFIG: Record<HeroClassId, Omit<Hero, 'relics' | 'defeatedBosses' | 'shieldCharges' | 'statueUsed' | 'inventory' | 'battleBuffs'>> = {
  CABALLERO: { name: 'Caballero', heroClass: 'CABALLERO', baseMaxHp: 150, flatMaxHpBonus: 0, percentMaxHpBonus: 0, hp: 150, maxHp: 150, mana: 0, maxMana: 0, baseAttack: 40, flatAttackBonus: 0, percentAttackBonus: 0, attack: 40, defense: 20, damageReduction: 0.2, evasionChance: 0, goldMultiplier: 1, shopDiscount: 0, gold: 50 },
  BARBARO: { name: 'Bárbaro', heroClass: 'BARBARO', baseMaxHp: 120, flatMaxHpBonus: 0, percentMaxHpBonus: 0, hp: 120, maxHp: 120, mana: 0, maxMana: 0, baseAttack: 60, flatAttackBonus: 0, percentAttackBonus: 0, attack: 60, defense: 5, damageReduction: 0, evasionChance: 0, goldMultiplier: 1, shopDiscount: 0, gold: 50 },
  PICARO: { name: 'Pícaro', heroClass: 'PICARO', baseMaxHp: 100, flatMaxHpBonus: 0, percentMaxHpBonus: 0, hp: 100, maxHp: 100, mana: 0, maxMana: 0, baseAttack: 50, flatAttackBonus: 0, percentAttackBonus: 0, attack: 50, defense: 10, damageReduction: 0, evasionChance: 0.2, goldMultiplier: 1.25, shopDiscount: 0, gold: 65 },
  MAGO: { name: 'Mago', heroClass: 'MAGO', baseMaxHp: 80, flatMaxHpBonus: 0, percentMaxHpBonus: 0, hp: 80, maxHp: 80, mana: 100, maxMana: 100, baseAttack: 70, flatAttackBonus: 0, percentAttackBonus: 0, attack: 70, defense: 5, damageReduction: 0, evasionChance: 0, goldMultiplier: 1, shopDiscount: 0, gold: 50 },
};

const medium = (name: string, hp: number, attack: number, goldReward: number): Enemy => ({ name, hp, maxHp: hp, attack, goldReward });

const MEDIUM_ENEMIES: Enemy[] = [
  medium('Orco', 50, 15, 30),
  medium('Esqueleto con Armadura', 40, 10, 20),
  medium('Bandido', 45, 20, 50),
  medium('Mago Corrupto', 30, 25, 40),
  medium('Elfo Malvado', 35, 20, 40),
];

const HIGH_ENEMIES: Enemy[] = [
  { name: 'Armadura Maldita', hp: 90, maxHp: 90, attack: 50, goldReward: 100, isElite: true, ability: 'REVIVE' },
  { name: 'Cíclope', hp: 80, maxHp: 80, attack: 60, goldReward: 100, isElite: true, ability: 'STUN' },
  { name: 'Árbol Viviente', hp: 100, maxHp: 100, attack: 40, goldReward: 120, isElite: true, ability: 'DOUBLE_ATTACK' },
  { name: 'Piromano Loco', hp: 50, maxHp: 50, attack: 75, goldReward: 110, isElite: true, ability: 'KAMIKAZE' },
  { name: 'Demonio', hp: 70, maxHp: 70, attack: 55, goldReward: 105, isElite: true, ability: 'CRITICAL' },
  { name: 'Espíritu Perdido', hp: 60, maxHp: 60, attack: 45, goldReward: 95, isElite: true, ability: 'EVADE' },
];

const LOW_GROUPS: Array<{ name: string; hp: number; attack: number; gold: number; min: number; max: number }> = [
  { name: 'Duende', hp: 10, attack: 5, gold: 10, min: 3, max: 4 },
  { name: 'Slime', hp: 12, attack: 3, gold: 5, min: 3, max: 5 },
  { name: 'Esqueleto', hp: 5, attack: 5, gold: 7, min: 4, max: 6 },
  { name: 'Jabalí Salvaje', hp: 15, attack: 8, gold: 15, min: 2, max: 3 },
];

const MEDIUM_GROUPS: Array<{ enemy: Enemy; min: number; max: number }> = [
  { enemy: MEDIUM_ENEMIES[0], min: 2, max: 3 },
  { enemy: MEDIUM_ENEMIES[1], min: 3, max: 4 },
  { enemy: MEDIUM_ENEMIES[2], min: 2, max: 3 },
  { enemy: MEDIUM_ENEMIES[3], min: 2, max: 4 },
  { enemy: MEDIUM_ENEMIES[4], min: 3, max: 5 },
];

const relic = (id: string, name: string, effectSummary: string, description: string) => ({ id, name, effectSummary, description });

const BOSSES: Enemy[] = [
  { name: 'Dragón Ancestral', hp: 400, maxHp: 400, attack: 67, goldReward: 600, isBoss: true, ability: 'FIRE', damageReduction: 0.3, bossRelic: relic('boss-dragon', 'Capa de Piel de Dragón', '-50 % Daño recibido', 'Disminuye el daño recibido un 50 %.') },
  { name: 'Emperador Caído', hp: 350, maxHp: 350, attack: 74, goldReward: 700, isBoss: true, ability: 'DOUBLE_ATTACK', evasionChance: 0.35, bossRelic: relic('boss-emp', 'Espada del Emperador', '65 % de golpear 2 veces', 'Al atacar hay un 65 % de probabilidades de golpear 2 veces.') },
  { name: 'Criatura Mutante Gigante', hp: 450, maxHp: 450, attack: 62, goldReward: 550, isBoss: true, ability: 'ACID', bossRelic: relic('boss-acid', 'Viseras Ácidas', '+50 % Daño total', 'Aumenta el daño infligido un 50 %.') },
  { name: 'Robot Enorme Descontrolado', hp: 550, maxHp: 550, attack: 50, goldReward: 650, isBoss: true, ability: 'CHARGE', bossRelic: relic('boss-shock', 'Dispositivo de Shock', '40 % de stunear', 'Al golpear hay un 40 % de probabilidades de stunear al rival un turno.') },
  { name: 'Titán Esquelético', hp: 500, maxHp: 500, attack: 58, goldReward: 800, isBoss: true, ability: 'ROCKS', bossRelic: relic('boss-hammer', 'Mazo de Hueso de Titán', 'Rocas cada 3 turnos', 'Cada 3 turnos permite un ataque extra con rocas de 30 de daño 2-4 veces.') },
  { name: 'Drácula', hp: 400, maxHp: 400, attack: 64, goldReward: 500, isBoss: true, ability: 'DRAIN', bossRelic: relic('boss-drac', 'Vampirismo Completo', 'Roba vida al eliminar', 'Al eliminar un enemigo suma su vida restante (100 % en el turno 1, 50 % en el 2, 25 % en el 3…).') },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function withIds(enemies: Enemy[]): Enemy[] {
  return enemies.map((enemy, index) => ({ ...enemy, id: `${enemy.name}-${index}-${Math.random().toString(36).slice(2, 6)}` }));
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Escalado: desde la sala 25, los enemigos comunes suben 20 % cada 10 salas.
// Los jefes no usan ese escalado: suben 10 % por cada jefe que ya haya caído.
export function enemyStatsMultiplier(defeatedBosses: string[], roomNumber: number, isBoss = false): number {
  if (isBoss) return 1 + defeatedBosses.length * 0.1;
  if (roomNumber < 25) return 1;
  return 1 + 0.2 * (Math.floor((roomNumber - 25) / 10) + 1);
}

function scale(enemy: Enemy, multiplier: number): Enemy {
  const hp = Math.round(enemy.hp * multiplier);
  return { ...enemy, hp, maxHp: Math.round(enemy.maxHp * multiplier), attack: Math.round(enemy.attack * multiplier), goldReward: Math.round(enemy.goldReward * multiplier) };
}

export function spawnEncounterForRoom(type: 'COMBAT' | 'ELITE' | 'BOSS', defeatedBosses: string[], roomNumber = 0): Enemy[] {
  const multiplier = enemyStatsMultiplier(defeatedBosses, roomNumber, type === 'BOSS');
  const goldFactor = type === 'COMBAT' ? 1.35 : type === 'ELITE' ? 1.2 : 1;
  const prepare = (enemy: Enemy): Enemy => {
    const scaled = scale(enemy, multiplier);
    return { ...scaled, goldReward: Math.round(scaled.goldReward * goldFactor) };
  };
  if (type === 'BOSS') {
    const available = BOSSES.filter((boss) => !defeatedBosses.includes(boss.name));
    return withIds([prepare({ ...pick(available.length > 0 ? available : BOSSES) })]);
  }
  if (type === 'ELITE') {
    if (Math.random() < 0.5) {
      const group = pick(MEDIUM_GROUPS);
      const count = randInt(group.min, group.max);
      return withIds(Array.from({ length: count }, () => prepare({ ...group.enemy })));
    }
    return withIds([prepare({ ...pick(HIGH_ENEMIES) })]);
  }
  if (Math.random() < 0.5) {
    return withIds([prepare({ ...pick(MEDIUM_ENEMIES) })]);
  }
  const group = pick(LOW_GROUPS);
  const count = randInt(group.min, group.max);
  const base: Enemy = { name: group.name, hp: group.hp, maxHp: group.hp, attack: group.attack, goldReward: group.gold };
  return withIds(Array.from({ length: count }, () => prepare({ ...base })));
}

// Compatibilidad con la UI existente: devuelve el primer enemigo del encuentro
export function spawnEnemyForRoom(type: 'COMBAT' | 'ELITE' | 'BOSS', defeatedBosses: string[]): Enemy {
  return spawnEncounterForRoom(type, defeatedBosses)[0];
}

type WeightedDoor = Omit<Door, 'id'> & { weight: number };

const BASE_DOORS: WeightedDoor[] = [
  { type: 'COMBAT', icon: '⚔️', title: 'Cámara de Combate', description: 'Enemigos acechan tras la puerta.', weight: 40 },
  { type: 'MERCHANT', icon: '🛒', title: 'Mercader Común', description: 'Pociones y reliquias básicas.', weight: 20 },
  { type: 'HELP_ROOM', icon: '🔥', title: 'Sala de Ayuda', description: 'Descanso para recuperar vida o maná.', weight: 12 },
  { type: 'MYSTERY', icon: '❓', title: 'Sala Misteriosa', description: 'Evento aleatorio oculto.', weight: 12 },
  { type: 'WISH_FOUNTAIN', icon: '⛲', title: 'Fuente de los Deseos', description: 'Arroja 1 moneda (5 % probabilidad de buff).', weight: 11 },
  { type: 'TREASURE', icon: '💰', title: 'Sala del Tesoro', description: 'Cofre con monedas o reliquias.', weight: 5 },
  { type: 'STATUE', icon: '🗿', title: 'Estatua Sagrada', description: 'Bendición única de clase (1 por partida).', weight: 5 },
];

const ELITE_DOOR: WeightedDoor = { type: 'ELITE', icon: '💀', title: 'Combate de Élite', description: 'Enemigos de alto nivel y mayor botín.', weight: 22 };
const LUXURY_DOOR: WeightedDoor = { type: 'LUXURY_MERCHANT', icon: '💎', title: 'Mercader de Lujo', description: 'Reliquias avanzadas y súper pociones.', weight: 9 };

function buildDoorPool(roomsCleared: number): WeightedDoor[] {
  const pool = [...BASE_DOORS];
  if (roomsCleared >= 10) pool.push(ELITE_DOOR);
  if (roomsCleared > 10) pool.push(LUXURY_DOOR);
  return pool;
}

export function generateProceduralDoors(roomsCleared: number, defeatedBosses: string[]): Door[] {
  const weightedPool = buildDoorPool(roomsCleared);
  const doorCount = Math.random() < 0.5 ? 2 : 3;
  const available = [...weightedPool];
  const chosenDoors: Omit<Door, 'id'>[] = [];

  while (chosenDoors.length < doorCount && available.length > 0) {
    const totalWeight = available.reduce((acc, item) => acc + item.weight, 0);
    let roll = Math.random() * totalWeight;
    const idx = available.findIndex((item) => { roll -= item.weight; return roll <= 0; });
    const { weight: _w, ...doorData } = available.splice(idx >= 0 ? idx : 0, 1)[0];
    chosenDoors.push(doorData);
  }

  const nextRoom = roomsCleared + 1;
  const remainingBosses = BOSSES.filter((boss) => !defeatedBosses.includes(boss.name));
  if (nextRoom >= 20 && nextRoom % 10 === 0 && remainingBosses.length > 0) {
    chosenDoors[0] = { type: 'BOSS' as RoomEventType, icon: '👑', title: 'Cámara del Jefe', description: 'Un jefe legendario custodia esta sala.' };
  }

  return chosenDoors.map((door, idx) => ({ ...door, id: `door-${roomsCleared}-${idx}-${Math.random().toString(36).slice(2, 6)}` }));
}

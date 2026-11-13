// =============================================================================
// SERVICIO DE PARTIDAS, TURNOS Y GENERACIÓN PROCEDURAL PONDERADA
// =============================================================================
import request from './apiService';
import type { ApiResponse, BackendRunRecord, BattleBuffs, Door, Enemy, GameState, Hero, HeroClassId } from '../types/game';

export const EMPTY_BATTLE_BUFFS: BattleBuffs = { damageBoostPercent: 0, evasionBonus: 0, defenseBonus: 0, blockCharges: 0 };

export const CLASS_CONFIG: Record<HeroClassId, Omit<Hero, 'relics' | 'defeatedBosses' | 'shieldCharges' | 'statueUsed' | 'inventory' | 'battleBuffs'>> = {
  CABALLERO: { name: 'Caballero', heroClass: 'CABALLERO', baseMaxHp: 150, flatMaxHpBonus: 0, percentMaxHpBonus: 0, hp: 150, maxHp: 150, mana: 0, maxMana: 0, baseAttack: 40, flatAttackBonus: 0, percentAttackBonus: 0, attack: 40, defense: 20, damageReduction: 0.2, evasionChance: 0, goldMultiplier: 1, shopDiscount: 0, gold: 50 },
  BARBARO: { name: 'Bárbaro', heroClass: 'BARBARO', baseMaxHp: 120, flatMaxHpBonus: 0, percentMaxHpBonus: 0, hp: 120, maxHp: 120, mana: 0, maxMana: 0, baseAttack: 60, flatAttackBonus: 0, percentAttackBonus: 0, attack: 60, defense: 5, damageReduction: 0, evasionChance: 0, goldMultiplier: 1, shopDiscount: 0, gold: 50 },
  PICARO: { name: 'Pícaro', heroClass: 'PICARO', baseMaxHp: 100, flatMaxHpBonus: 0, percentMaxHpBonus: 0, hp: 100, maxHp: 100, mana: 0, maxMana: 0, baseAttack: 50, flatAttackBonus: 0, percentAttackBonus: 0, attack: 50, defense: 10, damageReduction: 0, evasionChance: 0.2, goldMultiplier: 1.25, shopDiscount: 0, gold: 65 },
  MAGO: { name: 'Mago', heroClass: 'MAGO', baseMaxHp: 80, flatMaxHpBonus: 0, percentMaxHpBonus: 0, hp: 80, maxHp: 80, mana: 100, maxMana: 100, baseAttack: 70, flatAttackBonus: 0, percentAttackBonus: 0, attack: 70, defense: 5, damageReduction: 0, evasionChance: 0, goldMultiplier: 1, shopDiscount: 0, gold: 50 },
};

const ALL_BOSSES: Enemy[] = [
  { name: 'Dragón Ancestral', hp: 400, maxHp: 400, attack: 45, goldReward: 600, isBoss: true, bossRelic: { id: 'boss-dragon', name: 'Capa de Piel de Dragón', effectSummary: '-50 % Daño recibido', description: 'Disminuye el daño recibido en un 50 %.' } },
  { name: 'Emperador Caído', hp: 350, maxHp: 350, attack: 50, goldReward: 700, isBoss: true, bossRelic: { id: 'boss-emp', name: 'Espada del Emperador', effectSummary: '+25 Daño base', description: 'Suma +25 al daño base del héroe.' } },
  { name: 'Criatura Mutante Gigante', hp: 450, maxHp: 450, attack: 40, goldReward: 550, isBoss: true, bossRelic: { id: 'boss-acid', name: 'Viseras Ácidas', effectSummary: '+50 % Daño total', description: 'Aumenta el daño total en un +50 %.' } },
  { name: 'Drácula', hp: 400, maxHp: 400, attack: 42, goldReward: 500, isBoss: true, bossRelic: { id: 'boss-drac', name: 'Vampirismo Completo', effectSummary: '+25 % Vida máxima', description: 'Aumenta la vida máxima en +25 %.' } },
];

export function generateProceduralDoors(roomsCleared: number, defeatedBosses: string[]): Door[] {
  const weightedPool: Array<Omit<Door, 'id'> & { weight: number }> = [
    { type: 'COMBAT', icon: '⚔️', title: 'Cámara de Combate', description: 'Enemigos acechan tras la puerta.', weight: 40 },
    { type: 'MERCHANT', icon: '🛒', title: 'Mercader Común', description: 'Pociones y reliquias básicas.', weight: 20 },
    { type: 'HELP_ROOM', icon: '🔥', title: 'Sala de Ayuda', description: 'Descanso para recuperar vida o maná.', weight: 12 },
    { type: 'MYSTERY', icon: '❓', title: 'Sala Misteriosa', description: 'Evento aleatorio oculto.', weight: 12 },
    { type: 'WISH_FOUNTAIN', icon: '⛲', title: 'Fuente de los Deseos', description: 'Arroja 1 moneda (5 % probabilidad de buff).', weight: 11 },
    { type: 'TREASURE', icon: '💰', title: 'Sala del Tesoro', description: 'Cofre con monedas o reliquias.', weight: 5 },
    { type: 'STATUE', icon: '🗿', title: 'Estatua Sagrada', description: 'Bendición única de clase (1 por partida).', weight: 5 },
  ];

  if (roomsCleared > 10) {
    weightedPool.push({ type: 'ELITE', icon: '💀', title: 'Combate de Élite', description: 'Enemigos de alto nivel y mayor botín.', weight: 22 });
    weightedPool.push({ type: 'LUXURY_MERCHANT', icon: '💎', title: 'Mercader de Lujo', description: 'Reliquias avanzadas y súper pociones.', weight: 9 });
  }

  const doorCount = Math.random() < 0.5 ? 2 : 3;
  const available = [...weightedPool];
  const selected: Omit<Door, 'id'>[] = [];

  while (selected.length < doorCount && available.length > 0) {
    const totalWeight = available.reduce((acc, item) => acc + item.weight, 0);
    let roll = Math.random() * totalWeight;
    const idx = available.findIndex((item) => { roll -= item.weight; return roll <= 0; });
    const { weight: _w, ...doorData } = available.splice(idx >= 0 ? idx : 0, 1)[0];
    selected.push(doorData);
  }

  const remainingBosses = ALL_BOSSES.filter((b) => !defeatedBosses.includes(b.name));
  if (roomsCleared >= 20 && roomsCleared % 10 === 0 && remainingBosses.length > 0) {
    selected[0] = { type: 'BOSS', icon: '👑', title: 'Cámara del Jefe', description: 'Un jefe legendario custodia esta sala.' };
  }

  return selected.map((d, idx) => ({ ...d, id: `door-${roomsCleared}-${idx}-${Math.random().toString(36).slice(2, 6)}` }));
}

export function spawnEnemyForRoom(type: 'COMBAT' | 'ELITE' | 'BOSS', defeatedBosses: string[]): Enemy {
  if (type === 'BOSS') {
    const available = ALL_BOSSES.filter((b) => !defeatedBosses.includes(b.name));
    const pool = available.length > 0 ? available : ALL_BOSSES;
    return { ...pool[Math.floor(Math.random() * pool.length)] };
  }
  if (type === 'ELITE') {
    const elites: Enemy[] = [
      { name: 'Armadura Maldita', hp: 90, maxHp: 90, attack: 28, goldReward: 100, isElite: true },
      { name: 'Cíclope', hp: 80, maxHp: 80, attack: 32, goldReward: 100, isElite: true },
      { name: 'Demonio', hp: 70, maxHp: 70, attack: 30, goldReward: 105, isElite: true },
    ];
    return { ...elites[Math.floor(Math.random() * elites.length)] };
  }
  const normals: Enemy[] = [
    { name: 'Orco', hp: 50, maxHp: 50, attack: 15, goldReward: 30 },
    { name: 'Esqueleto con Armadura', hp: 40, maxHp: 40, attack: 10, goldReward: 20 },
    { name: 'Bandido', hp: 45, maxHp: 45, attack: 20, goldReward: 50 },
    { name: 'Mago Corrupto', hp: 30, maxHp: 30, attack: 25, goldReward: 40 },
    { name: 'Elfo Malvado', hp: 35, maxHp: 35, attack: 20, goldReward: 40 },
  ];
  return { ...normals[Math.floor(Math.random() * normals.length)] };
}

export async function startGameRun(clase: HeroClassId): Promise<GameState> {
  const response = await request<ApiResponse<BackendRunRecord>>('/game/start', {
    method: 'POST',
    body: JSON.stringify({ clase }),
  });
  const base = CLASS_CONFIG[clase];
  return {
    runId: Number(response.data.id),
    hero: {
      ...base, shieldCharges: 0, statueUsed: false, relics: [], defeatedBosses: [],
      battleBuffs: { ...EMPTY_BATTLE_BUFFS },
      inventory: [{ id: 'pot-heal-sm', name: 'Frasco de Curación Pequeño', effectType: 'HEAL', value: 50, durationLabel: 'Instantáneo', description: 'Regenera +50 HP al usarse en batalla.', quantity: 1 }],
    },
    currentRoom: 1, score: 0, inCombat: false, enemy: null, availableDoors: generateProceduralDoors(0, []),
    merchantItems: [], isLuxuryMerchant: false, currentEvent: null,
    logs: [`[Sala #1] Iniciaste como ${base.name} (${base.maxHp} HP, ${base.attack} Daño, ${base.gold} monedas).`],
    isFinished: false, finishReason: null, showLeaveConfirm: false,
  };
}

export async function syncRunTurn(runId: number, payload: Record<string, unknown>): Promise<void> {
  await request<ApiResponse<BackendRunRecord>>(`/game/run/${runId}/turn`, {
    method: 'POST',
    body: JSON.stringify({ accion: JSON.stringify(payload) }),
  });
}
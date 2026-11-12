// =============================================================================
// SERVICIO DE PARTIDAS, TURNOS Y GENERACIÓN PROCEDURAL (HTTP AISLADO)
// =============================================================================
import request from './apiService';
import type {
  ApiResponse,
  BackendRunRecord,
  Door,
  Enemy,
  GameState,
  Hero,
  HeroClassId,
} from '../types/game';

// Atributos base oficiales por clase según documento de diseño
export const CLASS_CONFIG: Record<HeroClassId, Omit<Hero, 'relics' | 'shieldCharges' | 'statueUsed'>> = {
  CABALLERO: { name: 'Caballero', heroClass: 'CABALLERO', hp: 150, maxHp: 150, mana: 0, maxMana: 0, attack: 40, defense: 20, gold: 50, potions: 1 },
  BARBARO: { name: 'Bárbaro', heroClass: 'BARBARO', hp: 120, maxHp: 120, mana: 0, maxMana: 0, attack: 60, defense: 5, gold: 50, potions: 1 },
  PICARO: { name: 'Pícaro', heroClass: 'PICARO', hp: 100, maxHp: 100, mana: 0, maxMana: 0, attack: 50, defense: 10, gold: 65, potions: 1 },
  MAGO: { name: 'Mago', heroClass: 'MAGO', hp: 80, maxHp: 80, mana: 100, maxMana: 100, attack: 70, defense: 5, gold: 50, potions: 1 },
};

// Genera entre 2 y 3 puertas aleatorias respetando reglas de progreso (Élite > 10, Jefe > 20)
export function generateProceduralDoors(roomsCleared: number): Door[] {
  const pool: Omit<Door, 'id'>[] = [
    { type: 'COMBAT', icon: '⚔️', title: 'Cámara de Combate', description: 'Enemigos acechan en la oscuridad.' },
    { type: 'MERCHANT', icon: '🛒', title: 'Mercader Común', description: 'Compra pociones y reliquias con tus monedas.' },
    { type: 'WISH_FOUNTAIN', icon: '⛲', title: 'Fuente de los Deseos', description: 'Arroja 1 moneda (5% probabilidad de buff permanente).' },
    { type: 'STATUE', icon: '🗿', title: 'Estatua Sagrada', description: 'Bendición exclusiva según tu clase (1 vez por partida).' },
    { type: 'HELP_ROOM', icon: '🔥', title: 'Sala de Ayuda', description: 'Hoguera o estanque para recuperar fuerzas.' },
    { type: 'TREASURE', icon: '💰', title: 'Sala del Tesoro', description: 'Un cofre antiguo con monedas u objetos.' },
    { type: 'MYSTERY', icon: '❓', title: 'Sala Misteriosa', description: 'Destino incierto detrás de una puerta sellada.' },
  ];

  if (roomsCleared >= 10) {
    pool.push({ type: 'ELITE', icon: '💀', title: 'Combate de Élite', description: 'Enemigos de alto nivel con grandes recompensas.' });
  }
  if (roomsCleared >= 20 && roomsCleared % 10 === 0) {
    pool.push({ type: 'BOSS', icon: '👑', title: 'Cámara del Jefe', description: 'Un guardián legendario bloquea el avance.' });
  }

  const doorCount = Math.random() < 0.5 ? 2 : 3;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, doorCount).map((d, idx) => ({
    ...d,
    id: `door-${roomsCleared}-${idx}-${Date.now()}`,
  }));
}

// Genera enemigos aleatorios según catálogo del documento de diseño
export function spawnEnemyForRoom(type: 'COMBAT' | 'ELITE' | 'BOSS'): Enemy {
  if (type === 'BOSS') {
    const bosses: Enemy[] = [
      { name: 'Dragón Ancestral', hp: 400, maxHp: 400, attack: 45, goldReward: 600, isBoss: true },
      { name: 'Emperador Caído', hp: 350, maxHp: 350, attack: 50, goldReward: 700, isBoss: true },
      { name: 'Drácula', hp: 400, maxHp: 400, attack: 42, goldReward: 500, isBoss: true },
    ];
    return bosses[Math.floor(Math.random() * bosses.length)];
  }
  if (type === 'ELITE') {
    const elites: Enemy[] = [
      { name: 'Armadura Maldita', hp: 90, maxHp: 90, attack: 28, goldReward: 100, isElite: true },
      { name: 'Cíclope', hp: 80, maxHp: 80, attack: 32, goldReward: 100, isElite: true },
      { name: 'Demonio', hp: 70, maxHp: 70, attack: 30, goldReward: 105, isElite: true },
    ];
    return elites[Math.floor(Math.random() * elites.length)];
  }
  const normals: Enemy[] = [
    { name: 'Orco', hp: 50, maxHp: 50, attack: 15, goldReward: 30 },
    { name: 'Esqueleto con Armadura', hp: 40, maxHp: 40, attack: 10, goldReward: 20 },
    { name: 'Bandido', hp: 45, maxHp: 45, attack: 20, goldReward: 50 },
    { name: 'Mago Corrupto', hp: 30, maxHp: 30, attack: 25, goldReward: 40 },
    { name: 'Elfo Malvado', hp: 35, maxHp: 35, attack: 20, goldReward: 40 },
  ];
  return normals[Math.floor(Math.random() * normals.length)];
}

// Inicia partida contra POST /api/game/start
export async function startGameRun(clase: HeroClassId): Promise<GameState> {
  const response = await request<ApiResponse<BackendRunRecord>>('/game/start', {
    method: 'POST',
    body: JSON.stringify({ clase }),
  });

  const base = CLASS_CONFIG[clase];
  return {
    runId: Number(response.data.id),
    hero: { ...base, shieldCharges: 0, statueUsed: false, relics: [] },
    currentRoom: 1,
    score: 0,
    inCombat: false,
    enemy: null,
    availableDoors: generateProceduralDoors(0),
    merchantItems: [],
    currentEvent: null,
    logs: [`Has ingresado a la mazmorra como ${base.name}. Puntuación inicial: 0.`],
    isFinished: false,
    finishReason: null,
  };
}

// Sincroniza progreso o cierre de partida con POST /api/game/run/:id/turn
export async function syncRunTurn(runId: number, payload: Record<string, unknown>): Promise<void> {
  await request<ApiResponse<BackendRunRecord>>(`/game/run/${runId}/turn`, {
    method: 'POST',
    body: JSON.stringify({ accion: JSON.stringify(payload) }),
  });
}
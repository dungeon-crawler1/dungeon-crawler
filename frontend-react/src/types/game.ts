// =============================================================================
// TIPOS E INTERFACES DEL MOTOR ROGUELIKE (ESPECIFICACIÓN OFICIAL)
// =============================================================================

export type HeroClassId = 'CABALLERO' | 'BARBARO' | 'PICARO' | 'MAGO';
export type SpellId = 'BOLA_FUEGO' | 'RAYO' | 'ESCUDO' | 'ESCAPE';

export type RoomEventType =
  | 'COMBAT'
  | 'ELITE'
  | 'BOSS'
  | 'MERCHANT'
  | 'WISH_FOUNTAIN'
  | 'STATUE'
  | 'HELP_ROOM'
  | 'TREASURE'
  | 'MYSTERY';

export interface Hero {
  name: string;
  heroClass: HeroClassId;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  gold: number;
  potions: number;
  shieldCharges: number;
  statueUsed: boolean;
  relics: string[];
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  goldReward: number;
  isElite?: boolean;
  isBoss?: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'POCION' | 'RELIQUIA';
  price: number;
  hpRestore: number;
  attackBonus: number;
  description: string;
}

export interface Door {
  id: string;
  type: RoomEventType;
  icon: string;
  title: string;
  description: string;
}

export interface GameEvent {
  title: string;
  description: string;
  type: 'WISH_FOUNTAIN' | 'STATUE' | 'HELP_ROOM' | 'TREASURE';
}

export interface GameState {
  runId: number | null;
  hero: Hero | null;
  currentRoom: number;
  score: number;
  inCombat: boolean;
  enemy: Enemy | null;
  availableDoors: Door[];
  merchantItems: ShopItem[];
  currentEvent: GameEvent | null;
  logs: string[];
  isFinished: boolean;
  finishReason: 'VICTORIA_RETIRO' | 'DERROTA' | null;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface BackendRunRecord {
  id: number;
  clase?: string;
  vida_actual?: number;
  vida_maxima?: number;
  ataque?: number;
  defensa?: number;
  oro?: number;
  puntuacion?: number;
  estado?: string;
  estado_juego?: Record<string, unknown>;
}
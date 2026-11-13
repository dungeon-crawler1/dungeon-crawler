// =============================================================================
// TIPOS E INTERFACES DEL MOTOR ROGUELIKE (MODIFICADORES BASE Y PORCENTUALES)
// =============================================================================
export type HeroClassId = 'CABALLERO' | 'BARBARO' | 'PICARO' | 'MAGO';
export type SpellId = 'BOLA_FUEGO' | 'RAYO' | 'ESCUDO' | 'ESCAPE';
export type PotionEffectType = 'HEAL' | 'DAMAGE_BOOST' | 'EVASION_BOOST' | 'DEFENSE_BOOST' | 'BLOCK_ATTACKS';
export type RoomEventType = 'COMBAT' | 'ELITE' | 'BOSS' | 'MERCHANT' | 'LUXURY_MERCHANT' | 'WISH_FOUNTAIN' | 'STATUE' | 'HELP_ROOM' | 'TREASURE' | 'MYSTERY';

export interface EquippedRelic {
  id: string;
  name: string;
  effectSummary: string;
  description: string;
}

export interface InventoryPotion {
  id: string;
  name: string;
  effectType: PotionEffectType;
  value: number;
  durationLabel: string;
  description: string;
  quantity: number;
}

export interface BattleBuffs {
  damageBoostPercent: number;
  evasionBonus: number;
  defenseBonus: number;
  blockCharges: number;
}

// Atributos del héroe separando valores base/suma de bonos porcentuales
export interface Hero {
  name: string;
  heroClass: HeroClassId;
  baseMaxHp: number;
  flatMaxHpBonus: number;
  percentMaxHpBonus: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  baseAttack: number;
  flatAttackBonus: number;
  percentAttackBonus: number;
  attack: number;
  defense: number;
  damageReduction: number;
  evasionChance: number;
  goldMultiplier: number;
  shopDiscount: number;
  gold: number;
  inventory: InventoryPotion[];
  battleBuffs: BattleBuffs;
  shieldCharges: number;
  statueUsed: boolean;
  relics: EquippedRelic[];
  defeatedBosses: string[];
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  goldReward: number;
  isElite?: boolean;
  isBoss?: boolean;
  bossRelic?: EquippedRelic;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'POCION' | 'RELIQUIA';
  price: number;
  effectType?: PotionEffectType;
  effectValue: number;
  durationLabel: string;
  effectSummary: string;
  flatAttackBonus: number;
  percentAttackBonus: number;
  flatMaxHpBonus: number;
  percentMaxHpBonus: number;
  reductionBonus: number;
  goldBonus: number;
  discountBonus: number;
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
  isLuxuryMerchant: boolean;
  currentEvent: GameEvent | null;
  logs: string[];
  isFinished: boolean;
  finishReason: 'VICTORIA_RETIRO' | 'DERROTA' | null;
  showLeaveConfirm: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface BackendRunRecord {
  id: number;
  clase?: string;
}
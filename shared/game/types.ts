// =============================================================================
// TIPOS E INTERFACES DEL MOTOR ROGUELIKE (MODIFICADORES BASE Y PORCENTUALES)
// =============================================================================
export type HeroClassId = 'CABALLERO' | 'BARBARO' | 'PICARO' | 'MAGO';
export type SpellId = 'BOLA_FUEGO' | 'RAYO' | 'ESCUDO' | 'ESCAPE' | 'EVASION' | 'FUERZA';
export type PotionEffectType = 'HEAL' | 'DAMAGE_BOOST' | 'EVASION_BOOST' | 'DEFENSE_BOOST' | 'BLOCK_ATTACKS' | 'HEAL_FULL' | 'ESCAPE_ROOM';
export type RoomEventType = 'COMBAT' | 'ELITE' | 'BOSS' | 'MERCHANT' | 'LUXURY_MERCHANT' | 'WISH_FOUNTAIN' | 'STATUE' | 'HELP_ROOM' | 'TREASURE' | 'MYSTERY';

// Habilidades pasivas o ataques especiales de enemigos y jefes
export type EnemyAbility =
  | 'REVIVE' | 'STUN' | 'DOUBLE_ATTACK' | 'KAMIKAZE' | 'CRITICAL' | 'EVADE'
  | 'HARD_SKIN' | 'ACID' | 'FIRE' | 'DRAIN' | 'ROCKS' | 'CHARGE' | 'REGEN' | 'LIFESTEAL';

export interface EnemyStatuses {
  stunTurns: number;
  acidTurns: number;
  burnTurns: number;
}

export interface HeroStatuses {
  evasionTurns: number;
  strengthTurns: number;
  stunTurns: number;
  acidTurns: number;
  burnTurns: number;
}

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
  // Extensiones de la especificación de juego
  percentMaxManaBonus?: number;
  spellCostMultiplier?: number;
  lifestealOnKill?: number;
  maxHpPerKill?: number;
  firstTurnDamageBonus?: number;
  previewEnabled?: boolean;
  statuses?: HeroStatuses;
  turn?: number;
  defeatedEnemies?: number;
  burnDamage?: number;
  acidDamage?: number;
}

export interface Enemy {
  id?: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  goldReward: number;
  isElite?: boolean;
  isBoss?: boolean;
  bossRelic?: EquippedRelic;
  ability?: EnemyAbility;
  damageReduction?: number;
  evasionChance?: number;
  revived?: boolean;
  rewarded?: boolean;
  statuses?: EnemyStatuses;
  chargeTurns?: number;
  specialCooldown?: number;
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
  percentMaxManaBonus?: number;
  description: string;
}

export interface DoorPreview {
  enemies?: Enemy[];
  merchantItems?: ShopItem[];
  isLuxuryMerchant?: boolean;
  event?: GameEvent;
}

export interface Door {
  id: string;
  type: RoomEventType;
  icon: string;
  title: string;
  description: string;
  preview?: string;
  previewData?: DoorPreview;
}

export interface GameEvent {
  title: string;
  description: string;
  type: 'WISH_FOUNTAIN' | 'STATUE' | 'HELP_ROOM' | 'TREASURE';
  statues?: HeroClassId[];
  helpType?: 'HOGUERA' | 'CABANA' | 'ESTANQUE' | 'COMEDOR';
  cost?: number;
}

export interface GameState {
  runId: number | null;
  hero: Hero | null;
  currentRoom: number;
  score: number;
  inCombat: boolean;
  enemy: Enemy | null;
  enemies?: Enemy[];
  targetIndex?: number;
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

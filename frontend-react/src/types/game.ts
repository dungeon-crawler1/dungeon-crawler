export interface Hero {
  id: string;
  name: string;
  heroClass: 'WARRIOR' | 'MAGE' | 'ROGUE';
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  gold: number;
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'POTION' | 'RELIC';
  price: number;
  effectValue: number;
  description: string;
}

export interface Door {
  id: string;
  type: 'COMBAT' | 'MERCHANT' | 'EVENT' | 'BOSS';
  title: string;
  description: string;
}

export interface GameEvent {
  title: string;
  description: string;
  type: 'FOUNTAIN' | 'STATUE' | 'TREASURE';
  hpBonus?: number;
  manaBonus?: number;
  goldBonus?: number;
}

export interface GameState {
  hero: Hero | null;
  currentRoom: number;
  inCombat: boolean;
  enemy: Enemy | null;
  availableDoors: Door[];
  merchantItems: ShopItem[];
  currentEvent: GameEvent | null;
  logs: string[];
}
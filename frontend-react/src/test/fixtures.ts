import type { Enemy, Hero, InventoryPotion, ShopItem } from '../types/game';

export function makeHero(overrides: Partial<Hero> = {}): Hero {
  return {
    name: 'Caballero',
    heroClass: 'CABALLERO',
    baseMaxHp: 100,
    flatMaxHpBonus: 0,
    percentMaxHpBonus: 0,
    hp: 100,
    maxHp: 100,
    mana: 0,
    maxMana: 0,
    baseAttack: 20,
    flatAttackBonus: 0,
    percentAttackBonus: 0,
    attack: 20,
    defense: 10,
    damageReduction: 0,
    evasionChance: 0,
    goldMultiplier: 1,
    shopDiscount: 0,
    gold: 100,
    inventory: [],
    battleBuffs: { damageBoostPercent: 0, evasionBonus: 0, defenseBonus: 0, blockCharges: 0 },
    shieldCharges: 0,
    statueUsed: false,
    relics: [],
    defeatedBosses: [],
    ...overrides,
  };
}

export function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return { name: 'Orco', hp: 30, maxHp: 30, attack: 10, goldReward: 20, ...overrides };
}

export function makePotion(overrides: Partial<InventoryPotion> = {}): InventoryPotion {
  return {
    id: 'pot-heal-sm',
    name: 'Frasco de Curación',
    effectType: 'HEAL',
    value: 50,
    durationLabel: 'Instantáneo',
    description: 'Regenera vida.',
    quantity: 1,
    ...overrides,
  };
}

export function makeItem(overrides: Partial<ShopItem> = {}): ShopItem {
  return {
    id: 'item-test',
    name: 'Reliquia de Prueba',
    type: 'RELIQUIA',
    price: 50,
    effectValue: 0,
    durationLabel: 'Permanente',
    effectSummary: '+10 Daño',
    flatAttackBonus: 0,
    percentAttackBonus: 0,
    flatMaxHpBonus: 0,
    percentMaxHpBonus: 0,
    reductionBonus: 0,
    goldBonus: 0,
    discountBonus: 0,
    description: 'Descripción de prueba.',
    ...overrides,
  };
}

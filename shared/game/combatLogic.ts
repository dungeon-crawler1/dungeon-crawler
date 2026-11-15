// =============================================================================
// UTILIDADES PURAS: RECÁLCULO (BASE + SUMA) * (1 + %), COMBATE E INVENTARIO
// =============================================================================
import type { Enemy, Hero, HeroStatuses, InventoryPotion, ShopItem, SpellId } from './types';

export const EMPTY_HERO_STATUSES: HeroStatuses = { evasionTurns: 0, strengthTurns: 0, stunTurns: 0, acidTurns: 0, burnTurns: 0 };

export const SPELL_COSTS: Record<SpellId, number> = {
  BOLA_FUEGO: 30,
  RAYO: 55,
  ESCUDO: 40,
  ESCAPE: 60,
  EVASION: 30,
  FUERZA: 40,
};

export function heroStatuses(hero: Hero): HeroStatuses {
  return hero.statuses ?? EMPTY_HERO_STATUSES;
}

export function spellCost(hero: Hero, spell: SpellId): number {
  return Math.ceil(SPELL_COSTS[spell] * (hero.spellCostMultiplier ?? 1));
}

// Recalcula vida máxima y ataque aplicando todos los % sobre (base + suma)
export function recalculateHeroStats(hero: Hero): Hero {
  const totalBaseHp = hero.baseMaxHp + hero.flatMaxHpBonus;
  const computedMaxHp = Math.round(totalBaseHp * (1 + hero.percentMaxHpBonus));
  const maxHpGain = Math.max(0, computedMaxHp - hero.maxHp);
  const totalBaseAttack = hero.baseAttack + hero.flatAttackBonus;
  const computedAttack = Math.round(totalBaseAttack * (1 + hero.percentAttackBonus));
  return { ...hero, maxHp: computedMaxHp, hp: Math.min(computedMaxHp, hero.hp + maxHpGain), attack: computedAttack };
}

function temporaryDamageBonus(hero: Hero): number {
  const statuses = heroStatuses(hero);
  const strength = statuses.strengthTurns > 0 ? 0.3 : 0;
  const enrage = hero.heroClass === 'BARBARO' && hero.hp < hero.maxHp * 0.5 ? 0.4 : 0;
  const firstTurn = (hero.turn ?? 1) === 1 ? (hero.firstTurnDamageBonus ?? 0) : 0;
  return strength + enrage + firstTurn;
}

// Calcula daño físico aplicando porcentajes permanentes, de batalla y furia Bárbaro
export function calculateHeroPhysicalDamage(hero: Hero): number {
  const totalBaseAttack = hero.baseAttack + hero.flatAttackBonus;
  const percent = hero.percentAttackBonus + hero.battleBuffs.damageBoostPercent + temporaryDamageBonus(hero);
  return Math.round(totalBaseAttack * (1 + percent));
}

// Calcula daño de hechizos del Mago escalando sobre su base total
export function calculateSpellDamage(hero: Hero, spell: SpellId): number {
  const totalBaseAttack = hero.baseAttack + hero.flatAttackBonus;
  const totalPercent = hero.percentAttackBonus + hero.battleBuffs.damageBoostPercent + temporaryDamageBonus(hero);
  const scale = spell === 'RAYO' ? 1.6 : 1.15;
  return Math.round(totalBaseAttack * (1 + totalPercent) * scale);
}

interface CounterAttack {
  damageTaken: number;
  remainingPotionBlocks: number;
  remainingSpellShields: number;
  note: string;
}

function blockedAttack(note: string, potionBlocks: number, spellShields: number): CounterAttack {
  return { damageTaken: 0, remainingPotionBlocks: potionBlocks, remainingSpellShields: spellShields, note };
}

function knightBlocks(hero: Hero): boolean {
  return hero.heroClass === 'CABALLERO' && Math.random() < 0.2;
}

function heroEvades(hero: Hero): boolean {
  const statuses = heroStatuses(hero);
  const totalEvasion = hero.evasionChance + hero.battleBuffs.evasionBonus + (statuses.evasionTurns > 0 ? 0.4 : 0);
  return totalEvasion > 0 && Math.random() < totalEvasion;
}

// Resuelve contraataque considerando bloqueo, evasión acumulada y reducción de daño
export function calculateEnemyCounterAttack(hero: Hero, enemy: Enemy): CounterAttack {
  const { blockCharges } = hero.battleBuffs;
  if (blockCharges > 0) return blockedAttack(' (bloqueado por Poción)', blockCharges - 1, hero.shieldCharges);
  if (hero.shieldCharges > 0) return blockedAttack(' (bloqueado por Escudo Arcano)', 0, hero.shieldCharges - 1);
  if (knightBlocks(hero)) return blockedAttack(' (bloqueado con escudo)', 0, 0);
  if (heroEvades(hero)) return blockedAttack(' (esquivado)', 0, 0);

  const effectiveReduction = Math.min(0.85, hero.damageReduction + hero.battleBuffs.defenseBonus);
  const damageTaken = Math.max(1, Math.round(enemy.attack * (1 - effectiveReduction)));
  return { damageTaken, remainingPotionBlocks: 0, remainingSpellShields: 0, note: '' };
}

// Aplica oro y reliquia única al derrotar a un enemigo o jefe
export function applyVictoryRewards(hero: Hero, enemy: Enemy, updatedMana: number): { hero: Hero; earnedGold: number } {
  const earnedGold = Math.round(enemy.goldReward * hero.goldMultiplier);
  const relic = enemy.bossRelic;
  const ringHeals = (hero.lifestealOnKill ?? 0) > 0 && enemy.name !== 'Armadura Maldita';
  const ringHp = ringHeals ? Math.round(hero.maxHp * (hero.lifestealOnKill ?? 0)) : 0;
  const essenceBonus = hero.maxHpPerKill ?? 0;
  const victor = recalculateHeroStats({
    ...hero,
    mana: updatedMana,
    gold: hero.gold + earnedGold,
    hp: Math.min(hero.maxHp, hero.hp + ringHp),
    relics: relic ? [...hero.relics, relic] : hero.relics,
    defeatedBosses: enemy.isBoss ? [...hero.defeatedBosses, enemy.name] : hero.defeatedBosses,
    defeatedEnemies: (hero.defeatedEnemies ?? 0) + 1,
    flatAttackBonus: hero.flatAttackBonus,
    percentAttackBonus: hero.percentAttackBonus + (relic?.id === 'boss-acid' ? 0.5 : 0),
    percentMaxHpBonus: hero.percentMaxHpBonus + essenceBonus,
    damageReduction: Math.min(0.75, hero.damageReduction + (relic?.id === 'boss-dragon' ? 0.5 : 0)),
  });
  return { hero: victor, earnedGold };
}

function potionPurchase(hero: Hero, item: ShopItem): Hero {
  const existing = hero.inventory.find((potion) => potion.id === item.id);
  const inventory = existing
    ? hero.inventory.map((potion) => (potion.id === item.id ? { ...potion, quantity: potion.quantity + 1 } : potion))
    : [...hero.inventory, { id: item.id, name: item.name, effectType: item.effectType!, value: item.effectValue, durationLabel: item.durationLabel, description: item.description, quantity: 1 }];
  return { ...hero, gold: hero.gold - item.price, inventory };
}

function withManaBonus(hero: Hero, bonus: number): Hero {
  return {
    ...hero,
    maxMana: Math.round(hero.maxMana * (1 + bonus)),
    mana: Math.round(hero.mana * (1 + bonus)),
    percentMaxManaBonus: (hero.percentMaxManaBonus ?? 0) + bonus,
  };
}

const RELIC_EFFECTS: Record<string, (hero: Hero) => Hero> = {
  'rel-sharp': (hero) => (hero.heroClass === 'MAGO' ? hero : recalculateHeroStats({ ...hero, percentAttackBonus: hero.percentAttackBonus + 0.15 })),
  'rel-crystal': (hero) => (hero.heroClass === 'MAGO' ? withManaBonus(hero, 0.3) : hero),
  'lux-merlin': (hero) => withManaBonus(hero, 0.5),
  'rel-vampire': (hero) => ({ ...hero, lifestealOnKill: (hero.lifestealOnKill ?? 0) + 0.04 }),
  'lux-essence': (hero) => ({ ...hero, maxHpPerKill: (hero.maxHpPerKill ?? 0) + 0.05 }),
  'lux-telescope': (hero) => ({ ...hero, previewEnabled: true }),
  'lux-berserker': (hero) => ({ ...hero, firstTurnDamageBonus: (hero.firstTurnDamageBonus ?? 0) + 0.5 }),
};

// Guarda poción en inventario o equipa reliquia recalculando estadísticas
export function applyShopPurchase(hero: Hero, item: ShopItem): Hero {
  if (item.type === 'POCION' && item.effectType) return potionPurchase(hero, item);
  const upgraded = recalculateHeroStats({
    ...hero,
    gold: hero.gold - item.price,
    flatMaxHpBonus: hero.flatMaxHpBonus + item.flatMaxHpBonus,
    percentMaxHpBonus: hero.percentMaxHpBonus + item.percentMaxHpBonus,
    flatAttackBonus: hero.flatAttackBonus + item.flatAttackBonus,
    percentAttackBonus: hero.percentAttackBonus + item.percentAttackBonus,
    damageReduction: Math.min(0.75, hero.damageReduction + item.reductionBonus),
    goldMultiplier: hero.goldMultiplier + item.goldBonus,
    shopDiscount: Math.min(0.6, hero.shopDiscount + item.discountBonus),
    relics: [...hero.relics, { id: item.id, name: item.name, effectSummary: item.effectSummary, description: item.description }],
  });
  return RELIC_EFFECTS[item.id]?.(upgraded) ?? upgraded;
}

// Consume una poción del inventario durante el combate
export function consumeInventoryPotion(hero: Hero, potionId: string): { hero: Hero; message: string; escaped?: boolean } {
  const target = hero.inventory.find((potion) => potion.id === potionId);
  if (!target || target.quantity <= 0) return { hero, message: 'No tienes unidades disponibles.' };
  if (target.effectType === 'ESCAPE_ROOM') return { hero: removePotion(hero, target), message: '🌀 Poción de Escape: volvés a elegir el camino.', escaped: true };
  const nextInventory = hero.inventory
    .map((potion) => (potion.id === potionId ? { ...potion, quantity: potion.quantity - 1 } : potion))
    .filter((potion) => potion.quantity > 0);
  const nextBuffs = { ...hero.battleBuffs };
  let nextHp = hero.hp;
  if (target.effectType === 'HEAL') nextHp = Math.min(hero.maxHp, hero.hp + target.value);
  if (target.effectType === 'HEAL_FULL') nextHp = hero.maxHp;
  if (target.effectType === 'DAMAGE_BOOST') nextBuffs.damageBoostPercent = Math.max(nextBuffs.damageBoostPercent, target.value);
  if (target.effectType === 'EVASION_BOOST') nextBuffs.evasionBonus = Math.min(0.75, nextBuffs.evasionBonus + target.value);
  if (target.effectType === 'DEFENSE_BOOST') nextBuffs.defenseBonus = Math.min(0.75, nextBuffs.defenseBonus + target.value);
  if (target.effectType === 'BLOCK_ATTACKS') nextBuffs.blockCharges += target.value;
  return { hero: { ...hero, hp: nextHp, inventory: nextInventory, battleBuffs: nextBuffs }, message: `🧪 Usaste [${target.name}] (${target.durationLabel}): ${target.description}` };
}

function removePotion(hero: Hero, potion: InventoryPotion): Hero {
  const inventory = hero.inventory
    .map((item) => (item.id === potion.id ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0);
  return { ...hero, inventory };
}

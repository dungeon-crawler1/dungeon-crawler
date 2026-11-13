// =============================================================================
// UTILIDADES PURAS: RECÁLCULO (BASE + SUMA) * (1 + %), COMBATE E INVENTARIO
// =============================================================================
import type { Enemy, Hero, ShopItem, SpellId } from '../types/game';

// Recalcula vida máxima y ataque aplicando todos los % sobre (base + suma)
export function recalculateHeroStats(hero: Hero): Hero {
  const totalBaseHp = hero.baseMaxHp + hero.flatMaxHpBonus;
  const computedMaxHp = Math.round(totalBaseHp * (1 + hero.percentMaxHpBonus));
  const maxHpGain = Math.max(0, computedMaxHp - hero.maxHp);
  const totalBaseAttack = hero.baseAttack + hero.flatAttackBonus;
  const computedAttack = Math.round(totalBaseAttack * (1 + hero.percentAttackBonus));

  return { ...hero, maxHp: computedMaxHp, hp: Math.min(computedMaxHp, hero.hp + maxHpGain), attack: computedAttack };
}

// Calcula daño físico aplicando porcentajes permanentes, de batalla y furia Bárbaro
export function calculateHeroPhysicalDamage(hero: Hero): number {
  const totalBaseAttack = hero.baseAttack + hero.flatAttackBonus;
  const enragePercent = hero.heroClass === 'BARBARO' && hero.hp < hero.maxHp * 0.5 ? 0.4 : 0;
  return Math.round(totalBaseAttack * (1 + hero.percentAttackBonus + hero.battleBuffs.damageBoostPercent + enragePercent));
}

// Calcula daño de hechizos del Mago escalando sobre su base total
export function calculateSpellDamage(hero: Hero, spell: SpellId): number {
  const totalBaseAttack = hero.baseAttack + hero.flatAttackBonus;
  const totalPercent = hero.percentAttackBonus + hero.battleBuffs.damageBoostPercent;
  const scale = spell === 'RAYO' ? 1.6 : 1.15;
  return Math.round(totalBaseAttack * (1 + totalPercent) * scale);
}

// Resuelve contraataque considerando bloqueo, evasión acumulada y reducción de daño
export function calculateEnemyCounterAttack(hero: Hero, enemy: Enemy) {
  if (hero.battleBuffs.blockCharges > 0) {
    return { damageTaken: 0, remainingPotionBlocks: hero.battleBuffs.blockCharges - 1, remainingSpellShields: hero.shieldCharges, note: ' (bloqueado por Poción)' };
  }
  if (hero.shieldCharges > 0) {
    return { damageTaken: 0, remainingPotionBlocks: 0, remainingSpellShields: hero.shieldCharges - 1, note: ' (bloqueado por Escudo Arcano)' };
  }
  if (hero.heroClass === 'CABALLERO' && Math.random() < 0.2) {
    return { damageTaken: 0, remainingPotionBlocks: 0, remainingSpellShields: 0, note: ' (bloqueado con escudo)' };
  }
  const totalEvasion = hero.evasionChance + hero.battleBuffs.evasionBonus;
  if (totalEvasion > 0 && Math.random() < totalEvasion) {
    return { damageTaken: 0, remainingPotionBlocks: 0, remainingSpellShields: 0, note: ' (esquivado)' };
  }
  const effectiveReduction = Math.min(0.85, hero.damageReduction + hero.battleBuffs.defenseBonus);
  return { damageTaken: Math.max(1, Math.round(enemy.attack * (1 - effectiveReduction))), remainingPotionBlocks: 0, remainingSpellShields: 0, note: '' };
}

// Aplica oro y reliquia única al derrotar a un enemigo o jefe
export function applyVictoryRewards(hero: Hero, enemy: Enemy, updatedMana: number): { hero: Hero; earnedGold: number } {
  const earnedGold = Math.round(enemy.goldReward * hero.goldMultiplier);
  const relic = enemy.bossRelic;
  const victor = recalculateHeroStats({
    ...hero, mana: updatedMana, gold: hero.gold + earnedGold,
    relics: relic ? [...hero.relics, relic] : hero.relics,
    defeatedBosses: enemy.isBoss ? [...hero.defeatedBosses, enemy.name] : hero.defeatedBosses,
    flatAttackBonus: hero.flatAttackBonus + (relic?.id === 'boss-emp' ? 25 : 0),
    percentAttackBonus: hero.percentAttackBonus + (relic?.id === 'boss-acid' ? 0.5 : 0),
    percentMaxHpBonus: hero.percentMaxHpBonus + (relic?.id === 'boss-drac' ? 0.25 : 0),
    damageReduction: Math.min(0.75, hero.damageReduction + (relic?.id === 'boss-dragon' ? 0.5 : 0)),
  });
  return { hero: victor, earnedGold };
}

// Guarda poción en inventario o equipa reliquia recalculando estadísticas
export function applyShopPurchase(hero: Hero, item: ShopItem): Hero {
  if (item.type === 'POCION' && item.effectType) {
    const existing = hero.inventory.find((p) => p.id === item.id);
    const updatedInventory = existing
      ? hero.inventory.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p))
      : [...hero.inventory, { id: item.id, name: item.name, effectType: item.effectType, value: item.effectValue, durationLabel: item.durationLabel, description: item.description, quantity: 1 }];
    return { ...hero, gold: hero.gold - item.price, inventory: updatedInventory };
  }
  return recalculateHeroStats({
    ...hero, gold: hero.gold - item.price,
    flatMaxHpBonus: hero.flatMaxHpBonus + item.flatMaxHpBonus,
    percentMaxHpBonus: hero.percentMaxHpBonus + item.percentMaxHpBonus,
    flatAttackBonus: hero.flatAttackBonus + item.flatAttackBonus,
    percentAttackBonus: hero.percentAttackBonus + item.percentAttackBonus,
    damageReduction: Math.min(0.75, hero.damageReduction + item.reductionBonus),
    goldMultiplier: hero.goldMultiplier + item.goldBonus,
    shopDiscount: Math.min(0.6, hero.shopDiscount + item.discountBonus),
    relics: [...hero.relics, { id: item.id, name: item.name, effectSummary: item.effectSummary, description: item.description }],
  });
}

// Consume una poción del inventario durante el combate
export function consumeInventoryPotion(hero: Hero, potionId: string): { hero: Hero; message: string } {
  const target = hero.inventory.find((p) => p.id === potionId);
  if (!target || target.quantity <= 0) return { hero, message: 'No tienes unidades disponibles.' };

  const nextInventory = hero.inventory.map((p) => (p.id === potionId ? { ...p, quantity: p.quantity - 1 } : p)).filter((p) => p.quantity > 0);
  const nextBuffs = { ...hero.battleBuffs };
  let nextHp = hero.hp;

  if (target.effectType === 'HEAL') nextHp = Math.min(hero.maxHp, hero.hp + target.value);
  if (target.effectType === 'DAMAGE_BOOST') nextBuffs.damageBoostPercent = Math.max(nextBuffs.damageBoostPercent, target.value);
  if (target.effectType === 'EVASION_BOOST') nextBuffs.evasionBonus = Math.min(0.75, nextBuffs.evasionBonus + target.value);
  if (target.effectType === 'DEFENSE_BOOST') nextBuffs.defenseBonus = Math.min(0.75, nextBuffs.defenseBonus + target.value);
  if (target.effectType === 'BLOCK_ATTACKS') nextBuffs.blockCharges += target.value;

  return { hero: { ...hero, hp: nextHp, inventory: nextInventory, battleBuffs: nextBuffs }, message: `🧪 Usaste [${target.name}] (${target.durationLabel}): ${target.description}` };
}
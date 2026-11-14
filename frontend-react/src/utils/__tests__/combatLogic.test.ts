import { describe, expect, it, vi } from 'vitest';
import {
  applyShopPurchase,
  applyVictoryRewards,
  calculateEnemyCounterAttack,
  calculateHeroPhysicalDamage,
  calculateSpellDamage,
  consumeInventoryPotion,
  recalculateHeroStats,
} from '../combatLogic';
import { makeEnemy, makeHero, makeItem, makePotion } from '../../test/fixtures';

describe('recalculateHeroStats', () => {
  it('aplica sumas planas y porcentajes sobre la base total', () => {
    const hero = makeHero({
      baseMaxHp: 100,
      flatMaxHpBonus: 20,
      percentMaxHpBonus: 0.5,
      maxHp: 100,
      hp: 80,
      baseAttack: 20,
      flatAttackBonus: 10,
      percentAttackBonus: 0.5,
    });

    const result = recalculateHeroStats(hero);

    expect(result.maxHp).toBe(180);
    expect(result.hp).toBe(160);
    expect(result.attack).toBe(45);
  });

  it('no cura vida cuando la vida máxima calculada no aumenta', () => {
    const result = recalculateHeroStats(makeHero({ hp: 40 }));

    expect(result.maxHp).toBe(100);
    expect(result.hp).toBe(40);
  });
});

describe('cálculo de daño', () => {
  it('calcula el daño físico base', () => {
    expect(calculateHeroPhysicalDamage(makeHero())).toBe(20);
  });

  it('suma la furia del Bárbaro bajo el 50 % de vida', () => {
    const barbaro = makeHero({ heroClass: 'BARBARO', baseAttack: 60, hp: 40, maxHp: 100 });

    expect(calculateHeroPhysicalDamage(barbaro)).toBe(84);
    expect(calculateHeroPhysicalDamage({ ...barbaro, hp: 60 })).toBe(60);
  });

  it('aplica los buffs temporales de daño al ataque físico', () => {
    const hero = makeHero({ battleBuffs: { ...makeHero().battleBuffs, damageBoostPercent: 0.3 } });

    expect(calculateHeroPhysicalDamage(hero)).toBe(26);
  });

  it('escala hechizos según el hechizo y los bonos porcentuales', () => {
    const mago = makeHero({ heroClass: 'MAGO', baseAttack: 70, percentAttackBonus: 0.5 });

    expect(calculateSpellDamage(mago, 'RAYO')).toBe(168);
    expect(calculateSpellDamage(mago, 'BOLA_FUEGO')).toBe(121);
  });
});

describe('calculateEnemyCounterAttack', () => {
  it('bloquea el ataque con una poción de bloqueo', () => {
    const hero = makeHero({ battleBuffs: { ...makeHero().battleBuffs, blockCharges: 2 } });
    const result = calculateEnemyCounterAttack(hero, makeEnemy());

    expect(result).toMatchObject({ damageTaken: 0, remainingPotionBlocks: 1, note: ' (bloqueado por Poción)' });
  });

  it('consume un escudo arcano antes de calcular daño', () => {
    const result = calculateEnemyCounterAttack(makeHero({ shieldCharges: 1 }), makeEnemy());

    expect(result).toMatchObject({ damageTaken: 0, remainingSpellShields: 0, note: ' (bloqueado por Escudo Arcano)' });
  });

  it('permite el bloqueo pasivo del Caballero', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const result = calculateEnemyCounterAttack(makeHero(), makeEnemy());

    expect(result.note).toBe(' (bloqueado con escudo)');
    expect(result.damageTaken).toBe(0);
  });

  it('aplica evasión acumulada del héroe', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2);
    const hero = makeHero({ heroClass: 'PICARO', evasionChance: 0.3 });
    const result = calculateEnemyCounterAttack(hero, makeEnemy());

    expect(result).toMatchObject({ damageTaken: 0, note: ' (esquivado)' });
  });

  it('reduce el daño enemigo con la reducción de daño efectiva', () => {
    const hero = makeHero({ heroClass: 'MAGO', damageReduction: 0.2 });
    const result = calculateEnemyCounterAttack(hero, makeEnemy({ attack: 10 }));

    expect(result.damageTaken).toBe(8);
    expect(result.note).toBe('');
  });

  it('limita la reducción al 85 % y garantiza al menos 1 de daño', () => {
    const hero = makeHero({ heroClass: 'MAGO', damageReduction: 0.9 });
    const result = calculateEnemyCounterAttack(hero, makeEnemy({ attack: 100 }));
    const minimum = calculateEnemyCounterAttack(hero, makeEnemy({ attack: 1 }));

    expect(result.damageTaken).toBe(15);
    expect(minimum.damageTaken).toBe(1);
  });
});

describe('applyVictoryRewards', () => {
  it('entrega oro escalado y actualiza el maná restante', () => {
    const { hero, earnedGold } = applyVictoryRewards(makeHero({ goldMultiplier: 1.25 }), makeEnemy(), 7);

    expect(earnedGold).toBe(25);
    expect(hero.gold).toBe(125);
    expect(hero.mana).toBe(7);
    expect(hero.relics).toHaveLength(0);
  });

  it('registra jefe derrotado y aplica la reliquia de daño base', () => {
    const relic = { id: 'boss-emp', name: 'Espada del Emperador', effectSummary: 'x', description: 'x' };
    const enemy = makeEnemy({ name: 'Emperador Caído', isBoss: true, bossRelic: relic });
    const { hero } = applyVictoryRewards(makeHero(), enemy, 0);

    expect(hero.relics).toEqual([relic]);
    expect(hero.defeatedBosses).toEqual(['Emperador Caído']);
    expect(hero.flatAttackBonus).toBe(25);
    expect(hero.attack).toBe(45);
  });

  it('aplica las reliquias de daño porcentual y vida máxima', () => {
    const acid = { id: 'boss-acid', name: 'Viseras Ácidas', effectSummary: 'x', description: 'x' };
    const drac = { id: 'boss-drac', name: 'Vampirismo Completo', effectSummary: 'x', description: 'x' };
    const acidHero = applyVictoryRewards(makeHero(), makeEnemy({ isBoss: true, bossRelic: acid }), 0).hero;
    const dracHero = applyVictoryRewards(makeHero(), makeEnemy({ isBoss: true, bossRelic: drac }), 0).hero;

    expect(acidHero.percentAttackBonus).toBe(0.5);
    expect(acidHero.attack).toBe(30);
    expect(dracHero.percentMaxHpBonus).toBe(0.25);
    expect(dracHero.maxHp).toBe(125);
  });

  it('aplica la reliquia de reducción de daño respetando el tope', () => {
    const dragon = { id: 'boss-dragon', name: 'Capa de Piel de Dragón', effectSummary: 'x', description: 'x' };
    const { hero } = applyVictoryRewards(makeHero({ damageReduction: 0.4 }), makeEnemy({ isBoss: true, bossRelic: dragon }), 0);

    expect(hero.damageReduction).toBe(0.75);
  });
});

describe('applyShopPurchase', () => {
  it('agrega una poción nueva al inventario', () => {
    const item = makeItem({ id: 'pot-heal-md', type: 'POCION', effectType: 'HEAL', price: 30 });
    const hero = applyShopPurchase(makeHero({ gold: 100 }), item);

    expect(hero.gold).toBe(70);
    expect(hero.inventory).toHaveLength(1);
    expect(hero.inventory[0]).toMatchObject({ id: 'pot-heal-md', quantity: 1 });
  });

  it('incrementa la cantidad de una poción existente', () => {
    const item = makeItem({ id: 'pot-heal-sm', type: 'POCION', effectType: 'HEAL', price: 30 });
    const hero = applyShopPurchase(makeHero({ inventory: [makePotion()] }), item);

    expect(hero.inventory[0].quantity).toBe(2);
    expect(hero.gold).toBe(70);
  });

  it('equipa una reliquia y recalcula todos los bonos', () => {
    const item = makeItem({ flatAttackBonus: 10, reductionBonus: 0.25, goldBonus: 0.3, discountBonus: 0.1 });
    const hero = applyShopPurchase(makeHero(), item);

    expect(hero.gold).toBe(50);
    expect(hero.attack).toBe(30);
    expect(hero.damageReduction).toBe(0.25);
    expect(hero.goldMultiplier).toBe(1.3);
    expect(hero.shopDiscount).toBe(0.1);
    expect(hero.relics).toHaveLength(1);
  });

  it('respeta los topes de reducción y descuento', () => {
    const item = makeItem({ reductionBonus: 0.5, discountBonus: 0.6 });
    const hero = applyShopPurchase(makeHero({ damageReduction: 0.5, shopDiscount: 0.5 }), item);

    expect(hero.damageReduction).toBe(0.75);
    expect(hero.shopDiscount).toBe(0.6);
  });
});

describe('consumeInventoryPotion', () => {
  it('informa cuando la poción no existe o no tiene unidades', () => {
    const missing = consumeInventoryPotion(makeHero(), 'inexistente');
    const empty = consumeInventoryPotion(makeHero({ inventory: [makePotion({ quantity: 0 })] }), 'pot-heal-sm');

    expect(missing.message).toBe('No tienes unidades disponibles.');
    expect(empty.message).toBe('No tienes unidades disponibles.');
  });

  it('cura vida sin superar la vida máxima y descuenta la poción', () => {
    const hero = makeHero({ hp: 70, inventory: [makePotion({ value: 50 })] });
    const result = consumeInventoryPotion(hero, 'pot-heal-sm');

    expect(result.hero.hp).toBe(100);
    expect(result.hero.inventory).toHaveLength(0);
    expect(result.message).toContain('Usaste [Frasco de Curación]');
  });

  it('aplica el buff de daño conservando el mayor porcentaje', () => {
    const potion = makePotion({ id: 'pot-str', effectType: 'DAMAGE_BOOST', value: 0.3 });
    const hero = makeHero({
      inventory: [potion],
      battleBuffs: { ...makeHero().battleBuffs, damageBoostPercent: 0.5 },
    });

    expect(consumeInventoryPotion(hero, 'pot-str').hero.battleBuffs.damageBoostPercent).toBe(0.5);
  });

  it('acumula evasión y defensa con tope del 75 %', () => {
    const evasion = makePotion({ id: 'pot-eva', effectType: 'EVASION_BOOST', value: 0.3 });
    const defense = makePotion({ id: 'pot-def', effectType: 'DEFENSE_BOOST', value: 0.4 });
    const hero = makeHero({
      inventory: [evasion, defense],
      battleBuffs: { ...makeHero().battleBuffs, evasionBonus: 0.6, defenseBonus: 0.4 },
    });
    const afterEvasion = consumeInventoryPotion(hero, 'pot-eva').hero;
    const afterDefense = consumeInventoryPotion(afterEvasion, 'pot-def').hero;

    expect(afterEvasion.battleBuffs.evasionBonus).toBe(0.75);
    expect(afterDefense.battleBuffs.defenseBonus).toBe(0.75);
  });

  it('suma cargas de bloqueo de ataques', () => {
    const potion = makePotion({ id: 'pot-blk', effectType: 'BLOCK_ATTACKS', value: 2 });
    const result = consumeInventoryPotion(makeHero({ inventory: [potion] }), 'pot-blk');

    expect(result.hero.battleBuffs.blockCharges).toBe(2);
  });
});

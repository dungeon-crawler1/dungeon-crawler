import { describe, expect, it, vi } from 'vitest';
import { enemyTurn, heroAttack } from '../../../../shared/game/combatEngine';
import { applyVictoryRewards } from '../../../../shared/game/combatLogic';
import { enemyStatsMultiplier, spawnEncounterForRoom } from '../../../../shared/game/gameContent';
import { makeEnemy, makeHero } from '../../test/fixtures';

function mage(overrides = {}) {
  return makeHero({ heroClass: 'MAGO', hp: 500, maxHp: 500, damageReduction: 0, mana: 100, maxMana: 100, ...overrides });
}

describe('jefes: robot y mutante', () => {
  it('el robot respeta el cooldown de 3 turnos', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const robot = makeEnemy({ name: 'Robot', isBoss: true, ability: 'CHARGE', hp: 500, maxHp: 500, attack: 100, specialCooldown: 2 });
    const result = enemyTurn(mage(), [robot]);

    expect(result.hero.hp).toBe(400);
    expect(result.enemies[0].specialCooldown).toBe(1);
    expect(result.enemies[0].chargeTurns).toBeUndefined();
  });

  it('el robot carga y descarga 200 % al turno siguiente', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const robot = makeEnemy({ name: 'Robot', isBoss: true, ability: 'CHARGE', hp: 500, maxHp: 500, attack: 100, specialCooldown: 0 });
    const charged = enemyTurn(mage(), [robot]);
    expect(charged.enemies[0].chargeTurns).toBe(1);
    expect(charged.hero.hp).toBe(500);

    const released = enemyTurn(charged.hero, charged.enemies);
    expect(released.hero.hp).toBe(300);
    expect(released.enemies[0].specialCooldown).toBe(3);
  });

  it('el robot enfurecido descarga en el mismo turno bajo el 50 % de vida', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const robot = makeEnemy({ name: 'Robot', isBoss: true, ability: 'CHARGE', hp: 200, maxHp: 500, attack: 100, specialCooldown: 0 });
    const result = enemyTurn(mage(), [robot]);

    expect(result.hero.hp).toBe(300);
    expect(result.enemies[0].chargeTurns).toBeUndefined();
    expect(result.enemies[0].specialCooldown).toBe(3);
  });

  it('el mutante aplica ácido con todos sus ataques bajo el 30 % de vida', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const mutant = makeEnemy({ name: 'Mutante', isBoss: true, ability: 'ACID', hp: 100, maxHp: 450, attack: 100 });
    const result = enemyTurn(mage(), [mutant]);

    expect(result.hero.statuses?.acidTurns).toBeGreaterThan(0);
    expect(result.hero.acidDamage).toBe(15);
  });
});

describe('balance de recompensas', () => {
  it('el anillo vampírico cura el 7 % de la vida máxima', () => {
    const hero = makeHero({ hp: 50, maxHp: 100, lifestealOnKill: 0.07 });
    const result = applyVictoryRewards(hero, makeEnemy({ name: 'Orco', goldReward: 0 }), 0);
    expect(result.hero.hp).toBe(57);
  });

  it('el anillo no cura contra la Armadura Maldita', () => {
    const hero = makeHero({ hp: 50, maxHp: 100, lifestealOnKill: 0.07 });
    const result = applyVictoryRewards(hero, makeEnemy({ name: 'Armadura Maldita', goldReward: 0 }), 0);
    expect(result.hero.hp).toBe(50);
  });

  it('los combates normales dan 35 % más monedas y las élites 20 %', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(spawnEncounterForRoom('COMBAT', [], 0)[0].goldReward).toBe(41);
    expect(spawnEncounterForRoom('ELITE', [], 0)[0].goldReward).toBe(36);
    expect(spawnEncounterForRoom('BOSS', [], 0)[0].goldReward).toBe(600);
  });

  it('los jefes tienen un daño balanceado', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const boss = spawnEncounterForRoom('BOSS', [], 0)[0];
    expect(boss.name).toBe('Dragón Ancestral');
    expect(boss.attack).toBe(67);
  });
});


describe('efectos al esquivar o bloquear', () => {
  it('no aplica aturdimiento si el ataque es bloqueado', () => {
    const random = vi.spyOn(Math, 'random');
    random.mockReturnValueOnce(0.99).mockReturnValueOnce(0).mockReturnValueOnce(0);
    const hero = makeHero({ heroClass: 'CABALLERO', hp: 500, maxHp: 500, damageReduction: 0 });
    const enemy = makeEnemy({ ability: 'STUN', attack: 100, isElite: true });
    const result = enemyTurn(hero, [enemy]);

    expect(result.hero.statuses?.stunTurns ?? 0).toBe(0);
  });

  it('sí aplica aturdimiento cuando el ataque conecta', () => {
    const random = vi.spyOn(Math, 'random');
    random.mockReturnValueOnce(0.99).mockReturnValueOnce(0.99).mockReturnValueOnce(0);
    const hero = makeHero({ heroClass: 'CABALLERO', hp: 500, maxHp: 500, damageReduction: 0 });
    const enemy = makeEnemy({ ability: 'STUN', attack: 100, isElite: true });
    const result = enemyTurn(hero, [enemy]);

    expect(result.hero.statuses?.stunTurns).toBe(1);
  });

  it('no aplica ácido pasivo si el ataque es bloqueado', () => {
    const random = vi.spyOn(Math, 'random');
    random.mockReturnValueOnce(0.99).mockReturnValueOnce(0).mockReturnValueOnce(0);
    const hero = makeHero({ heroClass: 'CABALLERO', hp: 500, maxHp: 500, damageReduction: 0 });
    const enemy = makeEnemy({ name: 'Mutante', ability: 'ACID', hp: 100, maxHp: 450, attack: 100, isBoss: true });
    const result = enemyTurn(hero, [enemy]);

    expect(result.hero.statuses?.acidTurns ?? 0).toBe(0);
  });

  it('no aplica el fuego del dragón si el héroe lo bloquea', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const hero = makeHero({ heroClass: 'CABALLERO', hp: 500, maxHp: 500, damageReduction: 0 });
    const dragon = makeEnemy({ ability: 'FIRE', attack: 100, isBoss: true, hp: 400, maxHp: 400, specialCooldown: 0 });
    const result = enemyTurn(hero, [dragon]);

    expect(result.hero.statuses?.burnTurns ?? 0).toBe(0);
  });

  it('el escudo de shock no aturde si el enemigo esquiva', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const shock = { id: 'boss-shock', name: 'Shock', effectSummary: 'x', description: 'x' };
    const hero = makeHero({ relics: [shock] });
    const enemy = makeEnemy({ evasionChance: 1, statuses: { stunTurns: 0, acidTurns: 0, burnTurns: 0 } });
    const result = heroAttack(hero, [enemy], 0);

    expect(result.enemies[0].statuses?.stunTurns ?? 0).toBe(0);
  });
});


describe('balance final de jefes', () => {
  it('un golpe de jefe no mata al Mago de una vez', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const hero = makeHero({ heroClass: 'MAGO', hp: 80, maxHp: 80, damageReduction: 0 });
    const boss = makeEnemy({ name: 'Emperador', isBoss: true, attack: 74, hp: 350, maxHp: 350 });
    const result = enemyTurn(hero, [boss]);
    expect(result.hero.hp).toBeGreaterThan(0);
  });

  it('las rocas del titán no borran al jugador de un golpe', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const titan = makeEnemy({ name: 'Titán', isBoss: true, ability: 'ROCKS', attack: 34, hp: 500, maxHp: 500, specialCooldown: 0 });
    const result = enemyTurn(mage(), [titan]);
    expect(result.hero.hp).toBeGreaterThan(0);
    expect(result.hero.hp).toBeLessThan(500);
  });
});


describe('derrota del jugador', () => {
  it('marca heroDead cuando el golpe supera la vida restante', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const hero = makeHero({ heroClass: 'MAGO', hp: 20, maxHp: 80, damageReduction: 0 });
    const enemy = makeEnemy({ attack: 100, isElite: true });
    const result = enemyTurn(hero, [enemy]);
    expect(result.heroDead).toBe(true);
    expect(result.hero.hp).toBe(0);
  });
});


describe('escalado desde la sala 25', () => {
  it('los enemigos comunes suben 20 % cada 10 salas', () => {
    expect(enemyStatsMultiplier([], 24)).toBe(1);
    expect(enemyStatsMultiplier([], 25)).toBeCloseTo(1.2);
    expect(enemyStatsMultiplier([], 35)).toBeCloseTo(1.4);
    expect(enemyStatsMultiplier([], 45)).toBeCloseTo(1.6);
  });

  it('los jefes suben 10 % por cada jefe derrotado y no por salas', () => {
    expect(enemyStatsMultiplier([], 25, true)).toBe(1);
    expect(enemyStatsMultiplier(['Dragón Ancestral'], 25, true)).toBeCloseTo(1.1);
    expect(enemyStatsMultiplier(['Dragón Ancestral'], 35, true)).toBeCloseTo(1.1);
    expect(enemyStatsMultiplier(['Dragón Ancestral', 'Emperador Caído'], 35, true)).toBeCloseTo(1.2);
  });

  it('aplica el escalado a los enemigos generados en la sala 25', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const normal = spawnEncounterForRoom('COMBAT', [], 25)[0];
    expect(normal.attack).toBe(18);
    expect(normal.hp).toBe(60);
  });
});

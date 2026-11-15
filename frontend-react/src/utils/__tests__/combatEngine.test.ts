import { describe, expect, it, vi } from 'vitest';
import { enemyTurn } from '../../../../shared/game/combatEngine';
import { applyVictoryRewards } from '../../../../shared/game/combatLogic';
import { spawnEncounterForRoom } from '../../../../shared/game/gameContent';
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

  it('los jefes tienen el daño reducido un 15 %', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const boss = spawnEncounterForRoom('BOSS', [], 0)[0];
    expect(boss.name).toBe('Dragón Ancestral');
    expect(boss.attack).toBe(119);
  });
});

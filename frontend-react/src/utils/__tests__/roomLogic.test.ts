import { describe, expect, it, vi } from 'vitest';
import { applyEventEffect, resolveDoorEncounter } from '../roomLogic';
import type { Door, GameEvent, RoomEventType } from '../../types/game';
import { makeHero } from '../../test/fixtures';

function makeDoor(type: RoomEventType, title = 'Sala de Prueba'): Door {
  return { id: 'door-1', type, icon: '🚪', title, description: 'Descripción de la sala.' };
}

function makeEvent(type: GameEvent['type'], title = 'Evento'): GameEvent {
  return { title, description: 'Descripción del evento.', type };
}

describe('resolveDoorEncounter', () => {
  it('inicia un combate al cruzar una puerta de combate', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = resolveDoorEncounter(makeDoor('COMBAT', 'Cámara de Combate'), makeHero(), 1);

    expect(result.inCombat).toBe(true);
    expect(result.enemy?.name).toBe('Orco');
    expect(result.log).toContain('Entraste a Cámara de Combate');
  });

  it('inicia combates de élite y de jefe', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const elite = resolveDoorEncounter(makeDoor('ELITE'), makeHero(), 11);
    const boss = resolveDoorEncounter(makeDoor('BOSS'), makeHero(), 20);

    expect(elite.enemy?.isElite).toBe(true);
    expect(boss.enemy?.isBoss).toBe(true);
    expect(boss.log).toContain('Dragón Ancestral');
  });

  it('abre el mercader común con stock de tres artículos', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = resolveDoorEncounter(makeDoor('MERCHANT'), makeHero(), 2);

    expect(result.inCombat).toBe(false);
    expect(result.merchantItems).toHaveLength(3);
    expect(result.isLuxuryMerchant).toBe(false);
    expect(result.log).toContain('Mercader Común');
  });

  it('abre el mercader de lujo con su stock avanzado', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = resolveDoorEncounter(makeDoor('LUXURY_MERCHANT'), makeHero(), 12);

    expect(result.isLuxuryMerchant).toBe(true);
    expect(result.log).toContain('Mercader de Lujo');
  });

  it('revela una sala misteriosa como combate en salas tempranas', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = resolveDoorEncounter(makeDoor('MYSTERY'), makeHero(), 5);

    expect(result.inCombat).toBe(true);
    expect(result.log).toContain('reveló: COMBAT');
  });

  it('revela una sala misteriosa avanzada como tesoro', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = resolveDoorEncounter(makeDoor('MYSTERY'), makeHero(), 11);

    expect(result.inCombat).toBe(false);
    expect(result.currentEvent?.type).toBe('TREASURE');
  });

  it('convierte las salas no combatientes en eventos resueltos', () => {
    const result = resolveDoorEncounter(makeDoor('TREASURE', 'Sala del Tesoro'), makeHero(), 3);

    expect(result).toEqual(expect.objectContaining({
      inCombat: false,
      enemy: null,
      currentEvent: { title: 'Sala del Tesoro', description: 'Descripción de la sala.', type: 'TREASURE' },
    }));
    expect(result.log).toContain('Entraste a Sala del Tesoro');
  });
});

describe('applyEventEffect', () => {
  it('no aplica efectos cuando el jugador ignora el evento', () => {
    const hero = makeHero();
    const result = applyEventEffect(hero, makeEvent('TREASURE'), false);

    expect(result.hero.gold).toBe(hero.gold);
    expect(result.message).toContain('Ignoraste');
  });

  it('suma entre 60 y 120 monedas al abrir un tesoro', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = applyEventEffect(makeHero({ gold: 10 }), makeEvent('TREASURE'), true);

    expect(result.hero.gold).toBe(70);
    expect(result.message).toContain('+60 monedas');
  });

  it('restaura maná y vida del Mago en la sala de ayuda', () => {
    const hero = makeHero({ heroClass: 'MAGO', mana: 50, maxMana: 100, hp: 50, maxHp: 100 });
    const result = applyEventEffect(hero, makeEvent('HELP_ROOM'), true);

    expect(result.hero.mana).toBe(80);
    expect(result.hero.hp).toBe(70);
    expect(result.message).toContain('Estanque Mágico');
  });

  it('restaura vida de otras clases sin superar el máximo', () => {
    const result = applyEventEffect(makeHero({ hp: 90 }), makeEvent('HELP_ROOM'), true);

    expect(result.hero.hp).toBe(100);
    expect(result.message).toContain('Cabaña Acogedora');
  });

  it('no permite desear sin monedas en la fuente', () => {
    const result = applyEventEffect(makeHero({ gold: 0 }), makeEvent('WISH_FOUNTAIN'), true);

    expect(result.hero.gold).toBe(0);
    expect(result.message).toContain('no tenías monedas');
  });

  it('concede el deseo de vida máxima y lo recalcula', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce(0.1);
    const result = applyEventEffect(makeHero({ gold: 10 }), makeEvent('WISH_FOUNTAIN'), true);

    expect(result.hero.gold).toBe(9);
    expect(result.hero.percentMaxHpBonus).toBe(0.3);
    expect(result.hero.maxHp).toBe(130);
  });

  it('concede los deseos de daño, reducción y descuento', () => {
    const heroes = [1, 2, 3].map((roll) => {
      const random = vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce((roll + 0.1) / 4);
      const result = applyEventEffect(makeHero({ gold: 10 }), makeEvent('WISH_FOUNTAIN'), true);
      random.mockRestore();
      return result.hero;
    });

    expect(heroes[0].percentAttackBonus).toBe(0.4);
    expect(heroes[1].damageReduction).toBe(0.2);
    expect(heroes[2].shopDiscount).toBe(0.2);
  });

  it('informa que la fuente no otorga buff en el 95 % de los casos', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = applyEventEffect(makeHero({ gold: 10 }), makeEvent('WISH_FOUNTAIN'), true);

    expect(result.hero.gold).toBe(9);
    expect(result.message).toContain('95 % sin efecto');
  });

  it('impide activar una segunda estatua en la misma partida', () => {
    const result = applyEventEffect(makeHero({ statueUsed: true }), makeEvent('STATUE'), true);

    expect(result.message).toContain('ya activaste una estatua');
  });

  it('aplica la bendición de la estatua para cada clase', () => {
    const caballero = applyEventEffect(makeHero(), makeEvent('STATUE'), true).hero;
    const barbaro = applyEventEffect(makeHero({ heroClass: 'BARBARO' }), makeEvent('STATUE'), true).hero;
    const picaro = applyEventEffect(makeHero({ heroClass: 'PICARO' }), makeEvent('STATUE'), true).hero;

    expect(caballero.damageReduction).toBe(0.4);
    expect(barbaro.percentAttackBonus).toBe(0.4);
    expect(picaro.evasionChance).toBe(0.3);
    expect(picaro.goldMultiplier).toBe(1.15);
  });

  it('aplica la bendición arcana al Mago y recalcula estadísticas', () => {
    const hero = makeHero({ heroClass: 'MAGO', mana: 50, maxMana: 100 });
    const result = applyEventEffect(hero, makeEvent('STATUE'), true);

    expect(result.hero.maxMana).toBe(150);
    expect(result.hero.mana).toBe(100);
    expect(result.hero.flatAttackBonus).toBe(15);
    expect(result.hero.attack).toBe(35);
    expect(result.message).toContain('Estatua Mágica');
  });
});

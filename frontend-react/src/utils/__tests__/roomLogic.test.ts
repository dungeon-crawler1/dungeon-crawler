import { describe, expect, it, vi } from 'vitest';
import { applyEventEffect, attachDoorPreviews, buildEvent, resolveDoorEncounter } from '../../../../shared/game/roomLogic';
import type { Door, GameEvent, RoomEventType } from '../../types/game';
import { makeHero } from '../../test/fixtures';

function makeDoor(type: RoomEventType, title = 'Sala de Prueba'): Door {
  return { id: 'door-1', type, icon: '🚪', title, description: 'Descripción de la sala.' };
}

function makeEvent(type: GameEvent['type'], extra: Partial<GameEvent> = {}): GameEvent {
  return { title: 'Evento', description: 'Descripción del evento.', type, ...extra };
}

describe('resolveDoorEncounter', () => {
  it('inicia un combate con uno o varios enemigos', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = resolveDoorEncounter(makeDoor('COMBAT', 'Cámara de Combate'), makeHero(), 1);

    expect(result.inCombat).toBe(true);
    expect(result.enemies.length).toBeGreaterThan(0);
    expect(result.enemy?.name).toBe('Orco');
    expect(result.log).toContain('Entraste a Cámara de Combate');
  });

  it('inicia combates de élite y de jefe', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const elite = resolveDoorEncounter(makeDoor('ELITE'), makeHero(), 11);
    const boss = resolveDoorEncounter(makeDoor('BOSS'), makeHero(), 20);

    expect(elite.enemies[0].isElite).toBe(true);
    expect(boss.enemies[0].isBoss).toBe(true);
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
    expect(result.log).toContain('revela COMBAT');
  });

  it('convierte las salas no combatientes en eventos resueltos', () => {
    const result = resolveDoorEncounter(makeDoor('TREASURE', 'Sala del Tesoro'), makeHero(), 3);

    expect(result).toEqual(expect.objectContaining({ inCombat: false, enemy: null, currentEvent: expect.objectContaining({ type: 'TREASURE' }) }));
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

  it('suma entre 60 y 120 monedas y un objeto al abrir un tesoro', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = applyEventEffect(makeHero({ gold: 10 }), makeEvent('TREASURE'), true);

    expect(result.hero.gold).toBe(70);
    expect(result.message).toContain('+60 monedas');
    expect(result.hero.inventory.length + result.hero.relics.length).toBeGreaterThan(0);
  });

  it('la hoguera regenera 20 de vida', () => {
    const result = applyEventEffect(makeHero({ hp: 50 }), makeEvent('HELP_ROOM', { helpType: 'HOGUERA' }), true);
    expect(result.hero.hp).toBe(70);
  });

  it('la cabaña regenera 40 de vida sin superar el máximo', () => {
    const result = applyEventEffect(makeHero({ hp: 90 }), makeEvent('HELP_ROOM', { helpType: 'CABANA' }), true);
    expect(result.hero.hp).toBe(100);
  });

  it('el estanque solo regenera maná a los magos', () => {
    const mago = applyEventEffect(makeHero({ heroClass: 'MAGO', mana: 50, maxMana: 100 }), makeEvent('HELP_ROOM', { helpType: 'ESTANQUE' }), true);
    const caballero = applyEventEffect(makeHero(), makeEvent('HELP_ROOM', { helpType: 'ESTANQUE' }), true);

    expect(mago.hero.mana).toBe(80);
    expect(caballero.hero.mana).toBe(0);
    expect(caballero.message).toContain('solo los magos');
  });

  it('el comedor cobra 15 monedas y regenera 40 de vida', () => {
    const result = applyEventEffect(makeHero({ gold: 20, hp: 50 }), makeEvent('HELP_ROOM', { helpType: 'COMEDOR' }), true);
    const broke = applyEventEffect(makeHero({ gold: 10, hp: 50 }), makeEvent('HELP_ROOM', { helpType: 'COMEDOR' }), true);

    expect(result.hero.gold).toBe(5);
    expect(result.hero.hp).toBe(90);
    expect(broke.hero.hp).toBe(50);
  });

  it('no permite desear sin monedas en la fuente', () => {
    const result = applyEventEffect(makeHero({ gold: 0 }), makeEvent('WISH_FOUNTAIN'), true);
    expect(result.message).toContain('no tenías monedas');
  });

  it('concede el deseo de vida máxima y lo recalcula', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce(0.1);
    const result = applyEventEffect(makeHero({ gold: 10 }), makeEvent('WISH_FOUNTAIN'), true);

    expect(result.hero.gold).toBe(9);
    expect(result.hero.percentMaxHpBonus).toBe(0.3);
    expect(result.hero.maxHp).toBe(130);
  });

  it('informa que la fuente no otorga buff en el 95 % de los casos', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = applyEventEffect(makeHero({ gold: 10 }), makeEvent('WISH_FOUNTAIN'), true);

    expect(result.hero.gold).toBe(9);
    expect(result.message).toContain('95 % sin efecto');
  });

  it('impide activar una segunda estatua en la misma partida', () => {
    const result = applyEventEffect(makeHero({ statueUsed: true }), makeEvent('STATUE', { statues: ['CABALLERO'] }), true);
    expect(result.message).toContain('ya activaste una estatua');
  });

  it('no activa estatuas de otra clase', () => {
    const result = applyEventEffect(makeHero(), makeEvent('STATUE', { statues: ['MAGO'] }), true);
    expect(result.message).toContain('No hay una estatua para tu clase');
  });

  it('aplica la bendición de la estatua para cada clase', () => {
    const caballero = applyEventEffect(makeHero(), makeEvent('STATUE', { statues: ['CABALLERO'] }), true).hero;
    const barbaro = applyEventEffect(makeHero({ heroClass: 'BARBARO' }), makeEvent('STATUE', { statues: ['BARBARO'] }), true).hero;
    const picaro = applyEventEffect(makeHero({ heroClass: 'PICARO' }), makeEvent('STATUE', { statues: ['PICARO'] }), true).hero;

    expect(caballero.damageReduction).toBe(0.4);
    expect(barbaro.percentAttackBonus).toBe(0.4);
    expect(picaro.evasionChance).toBe(0.3);
    expect(picaro.goldMultiplier).toBe(1.4);
  });

  it('suma las bonificaciones de estatua a las que ya tiene el héroe', () => {
    const caballero = applyEventEffect(makeHero({ damageReduction: 0.2 }), makeEvent('STATUE', { statues: ['CABALLERO'] }), true).hero;
    const picaro = applyEventEffect(makeHero({ heroClass: 'PICARO', evasionChance: 0.2, goldMultiplier: 1.25 }), makeEvent('STATUE', { statues: ['PICARO'] }), true).hero;

    expect(caballero.damageReduction).toBeCloseTo(0.6);
    expect(picaro.evasionChance).toBeCloseTo(0.5);
    expect(picaro.goldMultiplier).toBeCloseTo(1.65);
  });

  it('la estatua mágica reduce a la mitad el costo de los hechizos', () => {
    const result = applyEventEffect(makeHero({ heroClass: 'MAGO', mana: 50, maxMana: 100 }), makeEvent('STATUE', { statues: ['MAGO'] }), true);

    expect(result.hero.spellCostMultiplier).toBe(0.5);
    expect(result.message).toContain('se reduce a la mitad');
  });
});


describe('previews de estatua y sala de ayuda', () => {
  it('muestra la clase de la estatua antes de entrar', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const doors = attachDoorPreviews([makeDoor('STATUE')], makeHero({ heroClass: 'CABALLERO' }), 1);

    expect(doors[0].preview).toContain('Estatua Real (Caballero)');
    expect(doors[0].previewData?.event?.statues).toContain('CABALLERO');
  });

  it('muestra el tipo y la bonificación de la sala de ayuda', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const doors = attachDoorPreviews([makeDoor('HELP_ROOM')], makeHero(), 1);

    expect(doors[0].preview).toContain('Hoguera: +20 HP');
    expect(doors[0].previewData?.event?.helpType).toBe('HOGUERA');
  });

  it('no ofrece el estanque a clases sin maná', () => {
    const random = vi.spyOn(Math, 'random');
    for (const value of [0, 0.2, 0.5, 0.8, 0.99]) {
      random.mockReturnValue(value);
      expect(buildEvent('HELP_ROOM', 'CABALLERO')?.helpType).not.toBe('ESTANQUE');
    }
  });

  it('permite el estanque al mago', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(buildEvent('HELP_ROOM', 'MAGO')?.helpType).toBe('ESTANQUE');
  });
});

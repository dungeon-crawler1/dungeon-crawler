import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from '../apiService';
import {
  EMPTY_BATTLE_BUFFS,
  generateProceduralDoors,
  spawnEnemyForRoom,
  startGameRun,
  syncRunTurn,
} from '../gameService';

vi.mock('../apiService', () => ({ default: vi.fn() }));

const requestMock = vi.mocked(request);

describe('generateProceduralDoors', () => {
  it('genera 2 puertas cuando la tirada inicial es menor a 0.5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const doors = generateProceduralDoors(0, []);

    expect(doors).toHaveLength(2);
    expect(doors.map((d) => d.type)).toEqual(['COMBAT', 'MERCHANT']);
    expect(new Set(doors.map((d) => d.id)).size).toBe(2);
  });

  it('genera 3 puertas cuando la tirada inicial es mayor o igual a 0.5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.6);
    const doors = generateProceduralDoors(5, []);

    expect(doors).toHaveLength(3);
    doors.forEach((door) => expect(door).not.toHaveProperty('weight'));
  });

  it('incluye puertas de élite y mercader de lujo tras superar 10 salas', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const types = generateProceduralDoors(11, []).map((d) => d.type);

    expect(types).toContain('ELITE');
    expect(types).toContain('LUXURY_MERCHANT');
  });

  it('no incluye puertas avanzadas antes de 10 salas', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const types = generateProceduralDoors(9, []).map((d) => d.type);

    expect(types).not.toContain('ELITE');
    expect(types).not.toContain('LUXURY_MERCHANT');
  });

  it('reemplaza la primera puerta por un jefe al entrar a la sala 20, 30 o 40', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(generateProceduralDoors(19, ['Drácula'])[0].type).toBe('BOSS');
    expect(generateProceduralDoors(29, ['Drácula'])[0].type).toBe('BOSS');
    expect(generateProceduralDoors(20, ['Drácula'])[0].type).not.toBe('BOSS');
  });

  it('no crea puerta de jefe cuando todos los jefes fueron derrotados', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const defeated = ['Dragón Ancestral', 'Emperador Caído', 'Criatura Mutante Gigante', 'Robot Enorme Descontrolado', 'Titán Esquelético', 'Drácula'];
    const doors = generateProceduralDoors(19, defeated);

    expect(doors.some((d) => d.type === 'BOSS')).toBe(false);
  });
});

describe('spawnEnemyForRoom', () => {
  it('genera enemigos normales, de élite y jefes', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const normal = spawnEnemyForRoom('COMBAT', []);
    const elite = spawnEnemyForRoom('ELITE', []);
    const boss = spawnEnemyForRoom('BOSS', []);

    expect(normal.name).toBe('Orco');
    expect(elite.name).toBe('Orco');
    expect(boss.name).toBe('Dragón Ancestral');
    expect(boss.bossRelic).toBeDefined();
  });

  it('reutiliza el catálogo de jefes si todos fueron derrotados', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const defeated = ['Dragón Ancestral', 'Emperador Caído', 'Criatura Mutante Gigante', 'Robot Enorme Descontrolado', 'Titán Esquelético', 'Drácula'];
    const boss = spawnEnemyForRoom('BOSS', defeated);

    expect(boss.name).toBe('Dragón Ancestral');
  });
});

describe('startGameRun y syncRunTurn', () => {
  beforeEach(() => {
    requestMock.mockReset();
    requestMock.mockResolvedValue({ status: 'ok', message: '', data: { id: 17, clase: 'MAGO' } });
  });

  it('crea el estado inicial del héroe con la configuración de su clase', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = await startGameRun('MAGO');

    expect(state.runId).toBe(17);
    expect(state.hero?.heroClass).toBe('MAGO');
    expect(state.hero?.maxMana).toBe(100);
    expect(state.hero?.battleBuffs).toEqual(EMPTY_BATTLE_BUFFS);
    expect(state.logs[0]).toContain('Iniciaste como Mago');
    expect(state.availableDoors).toHaveLength(2);
  });

  it('envía el turno serializado al backend', async () => {
    await syncRunTurn(17, { puntuacion: 2, resultado: 'EN_PROGRESO' });

    expect(requestMock).toHaveBeenCalledWith('/game/run/17/turn', {
      method: 'POST',
      body: JSON.stringify({ accion: JSON.stringify({ puntuacion: 2, resultado: 'EN_PROGRESO' }) }),
    });
  });
});

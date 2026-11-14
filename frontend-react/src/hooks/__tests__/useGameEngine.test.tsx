import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';
import request from '../../services/apiService';
import { useGameEngine } from '../useGameEngine';
import type { Door, HeroClassId, RoomEventType } from '../../types/game';
import { makeItem } from '../../test/fixtures';

vi.mock('../../services/apiService', () => ({ default: vi.fn() }));

const requestMock = vi.mocked(request) as unknown as Mock;

function makeDoor(type: RoomEventType): Door {
  return { id: `door-${type}`, type, icon: '🚪', title: type, description: 'Descripción.' };
}

async function setup(classId: HeroClassId) {
  const view = renderHook(() => useGameEngine());
  await act(async () => {
    await view.result.current.selectClass(classId);
  });
  return view.result;
}

describe('useGameEngine', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    requestMock.mockReset();
    requestMock.mockResolvedValue({ status: 'ok', message: '', data: { id: 42, clase: 'MAGO' } });
  });

  it('inicia una partida con la clase seleccionada', async () => {
    const result = await setup('MAGO');

    expect(result.current.state.runId).toBe(42);
    expect(result.current.state.hero?.heroClass).toBe('MAGO');
    expect(result.current.state.currentRoom).toBe(1);
    expect(result.current.loading).toBe(false);
    expect(requestMock).toHaveBeenCalledWith('/game/start', expect.objectContaining({ method: 'POST' }));
  });

  it('expone el mensaje de error al fallar el inicio de partida', async () => {
    const { result } = renderHook(() => useGameEngine());
    requestMock.mockRejectedValueOnce(new Error('Servidor caído'));

    await act(async () => {
      await result.current.selectClass('BARBARO');
    });

    expect(result.current.error).toBe('Servidor caído');
    expect(result.current.loading).toBe(false);
    expect(result.current.state.hero).toBeNull();
  });

  it('usa un mensaje genérico ante errores no nativos', async () => {
    const { result } = renderHook(() => useGameEngine());
    requestMock.mockRejectedValueOnce('fallo');

    await act(async () => {
      await result.current.selectClass('PICARO');
    });

    expect(result.current.error).toBe('Error al iniciar la partida');
  });

  it('prepara el combate al elegir una puerta de combate', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));

    expect(result.current.state.inCombat).toBe(true);
    expect(result.current.state.enemy?.name).toBe('Orco');
    expect(result.current.state.logs[0]).toContain('[Sala #1]');
  });

  it('abre el mercader con su stock al elegir esa puerta', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('MERCHANT')));

    expect(result.current.state.merchantItems).toHaveLength(3);
    expect(result.current.state.isLuxuryMerchant).toBe(false);
  });

  it('registra el daño recibido cuando el enemigo sobrevive', async () => {
    const result = await setup('BARBARO');
    act(() => result.current.chooseDoor(makeDoor('ELITE')));

    await act(async () => {
      await result.current.attackEnemy();
    });

    expect(result.current.state.enemy?.hp).toBe(30);
    expect(result.current.state.hero?.hp).toBe(92);
    expect(result.current.state.logs[0]).toContain('Recibes 28 de daño');
  });

  it('completa la sala y sincroniza el turno al vencer', async () => {
    const result = await setup('CABALLERO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));

    await act(async () => {
      await result.current.attackEnemy();
    });
    await act(async () => {
      await result.current.attackEnemy();
    });

    expect(result.current.state.score).toBe(1);
    expect(result.current.state.inCombat).toBe(false);
    expect(result.current.state.hero?.gold).toBe(80);
    expect(requestMock).toHaveBeenCalledWith('/game/run/42/turn', expect.anything());
  });

  it('finaliza la partida con derrota cuando el héroe cae en combate', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('BOSS')));

    await act(async () => {
      await result.current.attackEnemy();
    });
    await act(async () => {
      await result.current.attackEnemy();
    });

    expect(result.current.state.hero?.hp).toBe(0);
    expect(result.current.state.isFinished).toBe(true);
    expect(result.current.state.finishReason).toBe('DERROTA');
    expect(result.current.state.logs[0]).toContain('Caíste ante Dragón Ancestral');
    expect(requestMock).toHaveBeenCalledWith('/game/run/42/turn', expect.anything());
  });

  it('activa el escudo arcano consumiendo maná', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));

    await act(async () => {
      await result.current.castSpell('ESCUDO');
    });

    expect(result.current.state.hero?.mana).toBe(60);
    expect(result.current.state.hero?.shieldCharges).toBe(2);
    expect(result.current.state.logs[0]).toContain('Escudo Arcano');
  });

  it('lanza hechizos de daño y resuelve la victoria', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));

    await act(async () => {
      await result.current.castSpell('RAYO');
    });

    expect(result.current.state.hero?.mana).toBe(45);
    expect(result.current.state.inCombat).toBe(false);
    expect(result.current.state.score).toBe(1);
  });

  it('permite escapar del combate y volver a elegir puerta', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));

    await act(async () => {
      await result.current.castSpell('ESCAPE');
    });

    expect(result.current.state.hero?.mana).toBe(40);
    expect(result.current.state.inCombat).toBe(false);
    expect(result.current.state.enemy).toBeNull();
    expect(result.current.state.availableDoors.length).toBeGreaterThan(0);
  });

  it('ignora hechizos y ataques cuando no hay héroe o enemigo', async () => {
    const { result } = renderHook(() => useGameEngine());

    await act(async () => {
      await result.current.castSpell('BOLA_FUEGO');
      await result.current.attackEnemy();
    });

    expect(result.current.state.hero).toBeNull();
    expect(requestMock).not.toHaveBeenCalled();
  });

  it('compra una poción y acumula su cantidad', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('MERCHANT')));
    const potion = result.current.state.merchantItems[0];

    act(() => result.current.buyItem(potion));

    expect(result.current.state.hero?.gold).toBe(20);
    expect(result.current.state.hero?.inventory[0].quantity).toBe(2);
  });

  it('equipa una reliquia y descuenta su precio', async () => {
    const result = await setup('MAGO');
    const relic = makeItem({ id: 'rel-x', price: 10, flatAttackBonus: 5 });

    act(() => result.current.buyItem(relic));

    expect(result.current.state.hero?.gold).toBe(40);
    expect(result.current.state.hero?.relics).toHaveLength(1);
    expect(result.current.state.hero?.attack).toBe(75);
  });

  it('rechaza la compra cuando falta oro', async () => {
    const result = await setup('MAGO');
    const relic = makeItem({ price: 999 });

    act(() => result.current.buyItem(relic));

    expect(result.current.state.hero?.gold).toBe(50);
    expect(result.current.state.hero?.relics).toHaveLength(0);
  });

  it('consume pociones del inventario durante la partida', async () => {
    const result = await setup('MAGO');

    act(() => result.current.usePotion('pot-heal-sm'));

    expect(result.current.state.hero?.inventory).toHaveLength(0);
    expect(result.current.state.logs[0]).toContain('Usaste [Frasco de Curación Pequeño]');
  });

  it('avanza de sala al salir del mercader', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('MERCHANT')));

    await act(async () => {
      await result.current.closeMerchant();
    });

    expect(result.current.state.score).toBe(1);
    expect(result.current.state.currentRoom).toBe(2);
    expect(requestMock).toHaveBeenCalledWith('/game/run/42/turn', expect.anything());
  });

  it('aplica el efecto del evento y avanza de sala', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('TREASURE')));

    await act(async () => {
      await result.current.resolveEvent('ACCEPT');
    });

    expect(result.current.state.hero?.gold).toBe(110);
    expect(result.current.state.score).toBe(1);
    expect(result.current.state.currentEvent).toBeNull();
  });

  it('ignora la resolución de eventos inexistentes', async () => {
    const result = await setup('MAGO');

    await act(async () => {
      await result.current.resolveEvent('ACCEPT');
    });

    expect(result.current.state.score).toBe(0);
    expect(result.current.state.hero?.gold).toBe(50);
  });

  it('finaliza la partida al retirarse', async () => {
    const result = await setup('MAGO');

    await act(async () => {
      await result.current.forfeitRun();
    });

    expect(result.current.state.isFinished).toBe(true);
    expect(result.current.state.finishReason).toBe('VICTORIA_RETIRO');
    expect(requestMock).toHaveBeenCalledWith('/game/run/42/turn', expect.anything());
  });

  it('reinicia la partida y controla el modal de salida', async () => {
    const result = await setup('MAGO');

    act(() => result.current.openLeaveConfirm());
    expect(result.current.state.showLeaveConfirm).toBe(true);
    act(() => result.current.closeLeaveConfirm());
    expect(result.current.state.showLeaveConfirm).toBe(false);
    act(() => result.current.resetRun());

    expect(result.current.state.hero).toBeNull();
  });
});

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
    expect(result.current.state.logs[0]).toContain('Iniciaste como Mago');
    expect(requestMock).toHaveBeenCalledWith('/game/start', expect.objectContaining({ method: 'POST' }));
  });

  it('expone el mensaje de error al fallar el inicio de partida', async () => {
    const { result } = renderHook(() => useGameEngine());
    requestMock.mockRejectedValueOnce(new Error('Servidor caído'));
    await act(async () => { await result.current.selectClass('BARBARO'); });
    expect(result.current.error).toBe('Servidor caído');
    expect(result.current.state.hero).toBeNull();
  });

  it('usa un mensaje genérico ante errores no nativos', async () => {
    const { result } = renderHook(() => useGameEngine());
    requestMock.mockRejectedValueOnce('fallo');
    await act(async () => { await result.current.selectClass('PICARO'); });
    expect(result.current.error).toBe('Error al iniciar la partida');
  });

  it('prepara el combate con enemigos al elegir una puerta', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));
    expect(result.current.state.inCombat).toBe(true);
    expect(result.current.state.enemies?.length).toBeGreaterThan(0);
    expect(result.current.state.logs[0]).toContain('[Sala #1]');
  });

  it('permite cambiar el objetivo entre varios enemigos', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));
    act(() => result.current.selectTarget(0));
    expect(result.current.state.targetIndex).toBe(0);
  });

  it('registra el daño recibido cuando el enemigo sobrevive', async () => {
    const result = await setup('CABALLERO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    await act(async () => { await result.current.attackEnemy(); });
    expect(result.current.state.enemy?.hp).toBeLessThan(50);
    expect(result.current.state.hero?.hp).toBeLessThan(150);
    expect(result.current.state.logs.join(' ')).toContain('ataca');
  });

  it('completa la sala y sincroniza el turno al vencer', async () => {
    const result = await setup('BARBARO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));
    await act(async () => { await result.current.attackEnemy(); });
    expect(result.current.state.score).toBe(1);
    expect(result.current.state.inCombat).toBe(false);
    expect(requestMock).toHaveBeenCalledWith('/game/run/42/turn', expect.anything());
  });

  it('finaliza la partida con derrota cuando el héroe cae', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('BOSS')));
    await act(async () => { await result.current.attackEnemy(); });
    expect(result.current.state.isFinished).toBe(true);
    expect(result.current.state.finishReason).toBe('DERROTA');
    expect(result.current.state.logs.join(' ')).toContain('Caíste');
  });

  it('activa el escudo arcano consumiendo maná', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('MERCHANT')));
    await act(async () => { await result.current.castSpell('ESCUDO'); });
    expect(result.current.state.hero?.mana).toBe(60);
    expect(result.current.state.hero?.shieldCharges).toBe(2);
  });

  it('lanza hechizos de daño y resuelve la victoria', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));
    await act(async () => { await result.current.castSpell('RAYO'); });
    expect(result.current.state.hero?.mana).toBe(45);
    expect(result.current.state.score).toBe(1);
  });

  it('permite escapar del combate y volver a elegir puerta', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('COMBAT')));
    await act(async () => { await result.current.castSpell('ESCAPE'); });
    expect(result.current.state.hero?.mana).toBe(40);
    expect(result.current.state.inCombat).toBe(false);
    expect(result.current.state.availableDoors.length).toBeGreaterThan(0);
  });

  it('ignora hechizos y ataques cuando no hay héroe', async () => {
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
    act(() => result.current.buyItem(makeItem({ id: 'rel-x', price: 10, flatAttackBonus: 5 })));
    expect(result.current.state.hero?.gold).toBe(40);
    expect(result.current.state.hero?.attack).toBe(75);
  });

  it('rechaza la compra cuando falta oro', async () => {
    const result = await setup('MAGO');
    act(() => result.current.buyItem(makeItem({ price: 999 })));
    expect(result.current.state.hero?.gold).toBe(50);
  });

  it('consume pociones del inventario', async () => {
    const result = await setup('MAGO');
    act(() => result.current.usePotion('pot-heal-sm'));
    expect(result.current.state.hero?.inventory).toHaveLength(0);
    expect(result.current.state.logs[0]).toContain('Usaste');
  });

  it('avanza de sala al salir del mercader', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('MERCHANT')));
    await act(async () => { await result.current.closeMerchant(); });
    expect(result.current.state.score).toBe(1);
    expect(result.current.state.currentRoom).toBe(2);
  });

  it('aplica el efecto del evento y avanza de sala', async () => {
    const result = await setup('MAGO');
    act(() => result.current.chooseDoor(makeDoor('TREASURE')));
    await act(async () => { await result.current.resolveEvent('ACCEPT'); });
    expect(result.current.state.hero?.gold).toBe(110);
    expect(result.current.state.score).toBe(1);
  });

  it('ignora la resolución de eventos inexistentes', async () => {
    const result = await setup('MAGO');
    await act(async () => { await result.current.resolveEvent('ACCEPT'); });
    expect(result.current.state.score).toBe(0);
  });

  it('finaliza la partida al retirarse', async () => {
    const result = await setup('MAGO');
    await act(async () => { await result.current.forfeitRun(); });
    expect(result.current.state.isFinished).toBe(true);
    expect(result.current.state.finishReason).toBe('VICTORIA_RETIRO');
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

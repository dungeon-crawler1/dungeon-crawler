import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClassSelector } from '../ClassSelector';
import { DoorSelector } from '../DoorSelector';
import { EventModal } from '../EventModal';
import { GameLog } from '../GameLog';
import { GameSummary } from '../GameSummary';
import { LeaveConfirmModal } from '../LeaveConfirmModal';
import type { Door } from '../../../types/game';

const door: Door = { id: 'd1', type: 'COMBAT', icon: '⚔️', title: 'Cámara de Combate', description: 'Enemigos al acecho.' };

describe('ClassSelector', () => {
  it('muestra las cuatro clases y notifica la elegida', () => {
    const onSelect = vi.fn();
    render(<ClassSelector onSelect={onSelect} disabled={false} />);

    expect(screen.getByText('Caballero')).toBeTruthy();
    expect(screen.getByText('Bárbaro')).toBeTruthy();
    expect(screen.getByText('Pícaro')).toBeTruthy();
    expect(screen.getByText('Mago')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Elegir Mago' }));
    expect(onSelect).toHaveBeenCalledWith('MAGO');
  });

  it('deshabilita los botones mientras inicia la partida', () => {
    render(<ClassSelector onSelect={vi.fn()} disabled />);

    const buttons = screen.getAllByRole('button', { name: 'Iniciando...' });
    expect(buttons).toHaveLength(4);
    buttons.forEach((button) => expect(button).toHaveProperty('disabled', true));
  });
});

describe('DoorSelector', () => {
  it('muestra las puertas disponibles y entrega la elegida', () => {
    const onChoose = vi.fn();
    render(<DoorSelector doors={[door]} onChoose={onChoose} disabled={false} />);

    expect(screen.getByText('🚪 Elige tu Siguiente Camino (1 puertas disponibles)')).toBeTruthy();
    expect(screen.getByText('Enemigos al acecho.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cruzar Puerta' }));
    expect(onChoose).toHaveBeenCalledWith(door);
  });
});

describe('EventModal', () => {
  it('resuelve el evento al aceptar o ignorar', () => {
    const onResolve = vi.fn();
    const event = { title: 'Fuente', description: 'Arroja una moneda.', type: 'WISH_FOUNTAIN' as const };
    render(<EventModal event={event} onResolve={onResolve} />);

    fireEvent.click(screen.getByRole('button', { name: 'Interactuar' }));
    expect(onResolve).toHaveBeenCalledWith('ACCEPT');
    fireEvent.click(screen.getByRole('button', { name: 'Ignorar y Seguir' }));
    expect(onResolve).toHaveBeenCalledWith('IGNORE');
  });
});

describe('GameLog', () => {
  it('lista todas las entradas de la bitácora', () => {
    render(<GameLog logs={['Primer evento', 'Segundo evento']} />);

    expect(screen.getByText('Primer evento')).toBeTruthy();
    expect(screen.getByText('Segundo evento')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('GameSummary', () => {
  it('muestra la derrota y permite reiniciar o volver', () => {
    const onRestart = vi.fn();
    const onGoHome = vi.fn();
    render(<GameSummary reason="DERROTA" score={4} gold={120} onRestart={onRestart} onGoHome={onGoHome} />);

    expect(screen.getByText('💀 Has Caído en la Mazmorra')).toBeTruthy();
    expect(screen.getByText(/Monedas acumuladas: 120/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '🔄 Jugar Nueva Partida' }));
    fireEvent.click(screen.getByRole('button', { name: '🏠 Volver a la Pantalla de Inicio' }));

    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it('muestra el retiro voluntario', () => {
    render(<GameSummary reason="VICTORIA_RETIRO" score={2} gold={10} onRestart={vi.fn()} onGoHome={vi.fn()} />);

    expect(screen.getByText('🏳️ Partida Finalizada por Retiro')).toBeTruthy();
  });
});

describe('LeaveConfirmModal', () => {
  it('confirma o cancela la salida de la partida', () => {
    const onConfirmLeave = vi.fn();
    const onCancel = vi.fn();
    render(<LeaveConfirmModal onConfirmLeave={onConfirmLeave} onCancel={onCancel} />);

    expect(screen.getByText('⚠️ Advertencia de Salida')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Perderás tu progreso/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar y Seguir Jugando' }));

    expect(onConfirmLeave).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

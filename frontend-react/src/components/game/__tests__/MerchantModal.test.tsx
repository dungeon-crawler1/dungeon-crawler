import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MerchantModal } from '../MerchantModal';
import { makeItem } from '../../../test/fixtures';

const potion = makeItem({
  id: 'pot-heal-sm',
  name: 'Frasco de Curación',
  type: 'POCION',
  effectType: 'HEAL',
  price: 30,
  description: 'Cura 50 HP.',
});

describe('MerchantModal', () => {
  it('vende artículos y permite continuar explorando', () => {
    const onBuy = vi.fn();
    const onClose = vi.fn();
    const relic = makeItem({ id: 'rel-1', name: 'Escudo', type: 'RELIQUIA', price: 500 });
    render(
      <MerchantModal items={[potion, relic]} isLuxury={false} playerGold={100} onBuy={onBuy} onClose={onClose} disabled={false} />,
    );

    expect(screen.getByText('🛒 Mercader Común - Tienda de la Mazmorra')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
    expect(screen.queryByText(/No hay más reliquias únicas/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Comprar (🪙 30)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar Explorando' }));

    expect(onBuy).toHaveBeenCalledWith(potion);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('avisa cuando no quedan reliquias en el mercader de lujo', () => {
    render(
      <MerchantModal items={[potion]} isLuxury playerGold={10} onBuy={vi.fn()} onClose={vi.fn()} disabled={false} />,
    );

    expect(screen.getByText('💎 Mercader de Lujo - Reliquias Avanzadas')).toBeTruthy();
    expect(screen.getByText(/No hay más reliquias únicas/)).toBeTruthy();
    const buy = screen.getByRole('button', { name: 'Comprar (🪙 30)' });
    expect(buy).toHaveProperty('disabled', true);
  });

  it('deshabilita todas las acciones mientras el juego está ocupado', () => {
    const onBuy = vi.fn();
    const onClose = vi.fn();
    render(
      <MerchantModal items={[potion]} isLuxury={false} playerGold={100} onBuy={onBuy} onClose={onClose} disabled />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Comprar (🪙 30)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar Explorando' }));

    expect(onBuy).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

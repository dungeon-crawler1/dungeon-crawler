import { describe, expect, it, vi } from 'vitest';
import { buildMerchantStock } from '../gameCatalog';
import type { EquippedRelic } from '../../types/game';

const relic = (name: string): EquippedRelic => ({ id: name, name, effectSummary: 'x', description: 'x' });

describe('buildMerchantStock', () => {
  it('genera dos pociones y una reliquia en el mercader común', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const stock = buildMerchantStock(false, [], 0);

    expect(stock.map((item) => item.id)).toEqual(['pot-heal-sm', 'pot-str', 'rel-sharp']);
    expect(stock[0].price).toBe(30);
  });

  it('genera el stock avanzado del mercader de lujo', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const stock = buildMerchantStock(true, [], 0);

    expect(stock.map((item) => item.id)).toEqual(['lux-heal-lg', 'lux-str', 'lux-bless']);
  });

  it('aplica el descuento del jugador a todos los precios', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const stock = buildMerchantStock(false, [], 0.2);

    expect(stock.map((item) => item.price)).toEqual([24, 40, 96]);
  });

  it('limita el descuento al 60 %', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const stock = buildMerchantStock(false, [], 0.9);

    expect(stock.map((item) => item.price)).toEqual([12, 20, 48]);
  });

  it('excluye las reliquias que el jugador ya posee', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const stock = buildMerchantStock(false, [relic('Afilador de Acero')], 0);

    expect(stock).toHaveLength(3);
    expect(stock[2].id).toBe('rel-life');
  });

  it('vende solo pociones cuando no quedan reliquias disponibles', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const owned = ['Afilador de Acero', 'Piedra de la Vida', 'Amuleto de Vitalidad', 'Imán de Oro', 'Escudo de Acero', 'Medalla de Mercader'];
    const stock = buildMerchantStock(false, owned.map(relic), 0);

    expect(stock).toHaveLength(2);
    expect(stock.every((item) => item.type === 'POCION')).toBe(true);
  });
});

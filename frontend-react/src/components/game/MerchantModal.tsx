// =============================================================================
// MODAL DE TIENDA PROCEDURAL (POCIONES Y RELIQUIAS)
// =============================================================================
import React from 'react';
import type { ShopItem } from '../../types/game';

interface Props {
  items: ShopItem[];
  playerGold: number;
  onBuy: (item: ShopItem) => void;
  onClose: () => void;
  disabled: boolean;
}

export const MerchantModal: React.FC<Props> = ({ items, playerGold, onBuy, onClose, disabled }) => {
  return (
    <div style={{ border: '2px solid #28a745', padding: '20px', borderRadius: '8px', background: '#1c2b1e', color: '#fff', marginTop: '15px' }}>
      <h3>🛒 Mercader de Lujo - Tienda de la Mazmorra</h3>
      <p>Tu Oro Disponible: 🪙 {playerGold}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: '1px solid #444', padding: '12px', borderRadius: '6px', background: '#111' }}>
            <strong>{item.name}</strong> <small>({item.type})</small>
            <p style={{ fontSize: '0.85em', margin: '6px 0' }}>{item.description}</p>
            <button
              onClick={() => onBuy(item)}
              disabled={disabled || playerGold < item.price}
              style={{ padding: '6px 12px', background: playerGold >= item.price ? '#28a745' : '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Comprar (🪙 {item.price})
            </button>
          </div>
        ))}
      </div>
      <button onClick={onClose} disabled={disabled} style={{ marginTop: '15px', padding: '8px 14px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Continuar Explorando
      </button>
    </div>
  );
};
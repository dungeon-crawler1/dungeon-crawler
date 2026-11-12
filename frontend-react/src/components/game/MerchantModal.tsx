import React from 'react';
import type { ShopItem } from '../../types/game';

interface Props {
  items: ShopItem[];
  playerGold: number;
  onBuy: (itemId: string) => void;
  onClose: () => void;
}

export const MerchantModal: React.FC<Props> = ({ items, playerGold, onBuy, onClose }) => {
  return (
    <div style={{ border: '2px solid #28a745', padding: '20px', borderRadius: '8px', background: '#1c2b1e', color: '#fff', marginTop: '15px' }}>
      <h3>🛒 Mercader de Lujo - Tienda de la Mazmorra</h3>
      <p>Tu Oro Actual: 🪙 {playerGold}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '15px' }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: '1px solid #444', padding: '10px', borderRadius: '6px', background: '#111' }}>
            <strong>{item.name}</strong> ({item.type})
            <p style={{ fontSize: '0.8em', margin: '4px 0' }}>{item.description}</p>
            <button
              onClick={() => onBuy(item.id)}
              disabled={playerGold < item.price}
              style={{ padding: '6px 12px', background: playerGold >= item.price ? '#28a745' : '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Comprar (🪙 {item.price})
            </button>
          </div>
        ))}
      </div>
      <button onClick={onClose} style={{ marginTop: '15px', padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Continuar Explorando
      </button>
    </div>
  );
};
// =============================================================================
// MODAL DE TIENDA DEL MERCADER (COMÚN Y DE LUJO)
// =============================================================================
import React from 'react';
import type { ShopItem } from '../../types/game';

interface Props {
  items: ShopItem[];
  isLuxury: boolean;
  playerGold: number;
  onBuy: (item: ShopItem) => void;
  onClose: () => void;
  disabled: boolean;
}

export const MerchantModal: React.FC<Props> = ({ items, isLuxury, playerGold, onBuy, onClose, disabled }) => {
  const hasRelic = items.some((i) => i.type === 'RELIQUIA');

  return (
    <div style={{ border: `2px solid ${isLuxury ? '#a855f7' : '#28a745'}`, padding: '20px', borderRadius: '8px', background: isLuxury ? '#241734' : '#1c2b1e', color: '#fff', marginTop: '15px' }}>
      <h3>{isLuxury ? '💎 Mercader de Lujo - Reliquias Avanzadas' : '🛒 Mercader Común - Tienda de la Mazmorra'}</h3>
      <p>Tu Oro Disponible: 🪙 <strong>{playerGold}</strong></p>

      {!hasRelic && (
        <div style={{ padding: '8px 12px', background: '#333', borderRadius: '4px', marginBottom: '10px', fontSize: '0.85em', color: '#ffd166' }}>
          ℹ️ No hay más reliquias únicas disponibles para vender en este mercader.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: '1px solid #555', padding: '12px', borderRadius: '6px', background: '#111' }}>
            <strong>{item.name}</strong> <small>({item.type})</small>
            <p style={{ fontSize: '0.82em', margin: '6px 0', minHeight: '38px' }}>{item.description}</p>
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
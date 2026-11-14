// =============================================================================
// SELECTOR PROCEDURAL DE 2 A 3 PUERTAS
// =============================================================================
import React from 'react';
import type { Door } from '../../types/game';

interface Props {
  doors: Door[];
  onChoose: (door: Door) => void;
  disabled: boolean;
}

export const DoorSelector: React.FC<Props> = ({ doors, onChoose, disabled }) => {
  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <h3>🚪 Elige tu Siguiente Camino ({doors.length} puertas disponibles)</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginTop: '15px', flexWrap: 'wrap' }}>
        {doors.map((door) => (
          <div key={door.id} style={{ border: '2px dashed #ffc107', padding: '16px', borderRadius: '8px', width: '220px', background: '#332b12', color: '#fff' }}>
            <div style={{ fontSize: '2em', marginBottom: '6px' }}>{door.icon}</div>
            <h4>{door.title}</h4>
            <p style={{ fontSize: '0.85em', minHeight: '42px' }}>{door.description}</p>
            <button
              onClick={() => onChoose(door)}
              disabled={disabled}
              style={{ padding: '8px 14px', background: '#ffc107', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cruzar Puerta
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
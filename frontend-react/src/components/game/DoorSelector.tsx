import React from 'react';
import { Door } from '../../types/game';

interface Props {
  doors: Door[];
  onChoose: (doorId: string) => void;
  disabled: boolean;
}

export const DoorSelector: React.FC<Props> = ({ doors, onChoose, disabled }) => {
  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <h3>🚪 Elige la Siguiente Puerta</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px' }}>
        {doors.map((door) => (
          <div key={door.id} style={{ border: '2px dashed #ffc107', padding: '15px', borderRadius: '8px', width: '200px', background: '#332b12', color: '#fff' }}>
            <h4>{door.title}</h4>
            <p style={{ fontSize: '0.85em', minHeight: '40px' }}>{door.description}</p>
            <button
              onClick={() => onChoose(door.id)}
              disabled={disabled}
              style={{ padding: '8px 12px', background: '#ffc107', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cruzar Puerta
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
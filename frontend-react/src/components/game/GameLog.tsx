// =============================================================================
// BITÁCORA DE TURNOS DE LA MAZMORRA
// =============================================================================
import React from 'react';

interface Props {
  logs: string[];
}

export const GameLog: React.FC<Props> = ({ logs }) => {
  return (
    <div style={{ marginTop: '20px', padding: '12px', background: '#141414', color: '#aaa', borderRadius: '6px', fontSize: '0.85em' }}>
      <strong>Bitácora de la Mazmorra:</strong>
      <ul style={{ margin: '6px 0 0 18px' }}>
        {logs.map((entry, idx) => (
          <li key={idx}>{entry}</li>
        ))}
      </ul>
    </div>
  );
};
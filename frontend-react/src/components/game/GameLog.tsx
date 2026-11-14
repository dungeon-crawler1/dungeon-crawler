// =============================================================================
// BITÁCORA DETALLADA DE EVENTOS Y CAMBIOS DE ESTADÍSTICAS
// =============================================================================
import React from 'react';

interface Props {
  logs: string[];
}

export const GameLog: React.FC<Props> = ({ logs }) => {
  return (
    <div style={{ marginTop: '20px', padding: '14px', background: '#141414', border: '1px solid #333', color: '#ddd', borderRadius: '6px', fontSize: '0.88em', maxHeight: '180px', overflowY: 'auto' }}>
      <strong>📜 Bitácora de la Mazmorra (Eventos y Estadísticas):</strong>
      <ul style={{ margin: '8px 0 0 18px', lineHeight: '1.5' }}>
        {logs.map((entry, idx) => (
          <li key={idx} style={{ color: idx === 0 ? '#ffd166' : '#bbb' }}>{entry}</li>
        ))}
      </ul>
    </div>
  );
};
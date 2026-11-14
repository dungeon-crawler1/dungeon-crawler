// =============================================================================
// MENÚ DESPLEGABLE DE ARTEFACTOS Y RELIQUIAS EQUIPADAS POR EL JUGADOR
// =============================================================================
import React, { useState } from 'react';
import type { EquippedRelic } from '../../types/game';

interface Props {
  relics: EquippedRelic[];
}

export const RelicsDropdown: React.FC<Props> = ({ relics }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div style={{ position: 'relative', marginTop: '10px' }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ padding: '6px 12px', background: '#2c3035', color: '#ffd166', border: '1px solid #555', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}
      >
        🏺 Artefactos Equipados ({relics.length}) {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div style={{ marginTop: '8px', padding: '10px 12px', background: '#16181b', border: '1px solid #555', borderRadius: '6px', fontSize: '0.84em' }}>
          {relics.length === 0 ? (
            <span style={{ color: '#aaa' }}>Aún no posees ningún artefacto o reliquia en esta partida.</span>
          ) : (
            <ul style={{ margin: '0 0 0 16px', padding: 0, lineHeight: '1.6' }}>
              {relics.map((relic) => (
                <li key={relic.id}>
                  <strong style={{ color: '#ffd166' }}>{relic.name}</strong> — <span style={{ color: '#8ce99a' }}>{relic.effectSummary}</span>
                  <span style={{ color: '#bbb' }}> ({relic.description})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
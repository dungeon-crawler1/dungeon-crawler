// =============================================================================
// COMPONENTE DE SELECCIÓN DE CLASE DE PERSONAJE
// =============================================================================
import React from 'react';
import { CLASS_CONFIG } from '../../services/gameService';
import type { HeroClassId } from '../../types/game';

interface Props {
  onSelect: (classId: HeroClassId) => void;
  disabled: boolean;
}

const CLASS_PERKS: Record<HeroClassId, string> = {
  CABALLERO: '🛡️ -20% daño recibido y 20% bloqueo',
  BARBARO: '🔥 +40% daño al tener < 50% de vida',
  PICARO: '🪙 +25% monedas y 20% evasión',
  MAGO: '✨ Único con hechizos arcanos de maná',
};

export const ClassSelector: React.FC<Props> = ({ onSelect, disabled }) => {
  const classes = Object.values(CLASS_CONFIG);

  return (
    <div style={{ textAlign: 'center', margin: '30px auto', maxWidth: '900px' }}>
      <h2>Selecciona tu Clase para Entrar a la Mazmorra</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '20px' }}>
        {classes.map((c) => (
          <div key={c.heroClass} style={{ border: '2px solid #444', borderRadius: '8px', padding: '14px', background: '#1a1a1a', color: '#fff' }}>
            <h3>{c.name}</h3>
            <p>❤️ Vida: {c.maxHp}</p>
            <p>⚔️ Daño: {c.attack}</p>
            {c.maxMana > 0 && <p>💧 Maná: {c.maxMana}</p>}
            <p style={{ fontSize: '0.8em', color: '#ccc', minHeight: '36px' }}>{CLASS_PERKS[c.heroClass]}</p>
            <button
              onClick={() => onSelect(c.heroClass)}
              disabled={disabled}
              style={{ marginTop: '10px', padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {disabled ? 'Iniciando...' : `Elegir ${c.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
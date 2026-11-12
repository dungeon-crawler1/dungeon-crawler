// =============================================================================
// HUD SUPERIOR: VIDA, MANÁ, MONEDAS, PUNTUACIÓN Y RETIRO DE PARTIDA
// =============================================================================
import React from 'react';
import type { Hero } from '../../types/game';

interface Props {
  hero: Hero;
  room: number;
  score: number;
  onForfeit: () => void;
  disabled: boolean;
}

export const HealthManaBar: React.FC<Props> = ({ hero, room, score, onForfeit, disabled }) => {
  const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
  const manaPercent = hero.maxMana > 0 ? Math.max(0, Math.min(100, (hero.mana / hero.maxMana) * 100)) : 0;

  return (
    <div style={{ padding: '15px', background: '#222', color: '#fff', borderRadius: '8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <strong>{hero.name}</strong> | 🚪 Habitación #{room} | 🏆 Puntuación: <strong>{score}</strong> | 🪙 Monedas: <strong>{hero.gold}</strong> | 🧪 Pociones: <strong>{hero.potions}</strong>
        </div>
        <button
          onClick={onForfeit}
          disabled={disabled}
          style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🏳️ Terminar Partida
        </button>
      </div>

      <div style={{ marginBottom: hero.maxMana > 0 ? '8px' : '0' }}>
        <small>Vida ({hero.hp} / {hero.maxHp})</small>
        <div style={{ background: '#555', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${hpPercent}%`, background: '#dc3545', height: '100%', transition: 'width 0.3s' }} />
        </div>
      </div>

      {hero.maxMana > 0 && (
        <div>
          <small>Maná ({hero.mana} / {hero.maxMana})</small>
          <div style={{ background: '#555', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${manaPercent}%`, background: '#007bff', height: '100%', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}
    </div>
  );
};
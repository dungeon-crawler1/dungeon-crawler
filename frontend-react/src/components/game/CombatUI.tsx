import React from 'react';
import { Enemy } from '../../types/game';

interface Props {
  enemy: Enemy;
  onAction: (action: 'ATTACK' | 'DEFEND' | 'SPELL' | 'FLEE') => void;
  disabled: boolean;
}

export const CombatUI: React.FC<Props> = ({ enemy, onAction, disabled }) => {
  const enemyHpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));

  return (
    <div style={{ border: '2px solid #dc3545', padding: '20px', borderRadius: '8px', background: '#2b1b1d', color: '#fff', marginTop: '15px' }}>
      <h3>⚔️ COMBATE CONTRA: {enemy.name}</h3>
      <div style={{ marginBottom: '15px' }}>
        <small>Vida del Enemigo ({enemy.hp} / {enemy.maxHp})</small>
        <div style={{ background: '#444', height: '18px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${enemyHpPercent}%`, background: '#ff4d4d', height: '100%', transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '15px' }}>
        <button onClick={() => onAction('ATTACK')} disabled={disabled} style={btnStyle('#dc3545')}>⚔️ Atacar</button>
        <button onClick={() => onAction('DEFEND')} disabled={disabled} style={btnStyle('#ffc107')}>🛡️ Defender</button>
        <button onClick={() => onAction('SPELL')} disabled={disabled} style={btnStyle('#17a2b8')}>✨ Hechizo</button>
        <button onClick={() => onAction('FLEE')} disabled={disabled} style={btnStyle('#6c757d')}>🏃 Huir</button>
      </div>
    </div>
  );
};

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '10px',
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
});
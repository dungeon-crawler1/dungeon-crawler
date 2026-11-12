// =============================================================================
// INTERFAZ DE COMBATE POR TURNOS (ATAQUE, POCIONES Y HECHIZOS DE MAGO)
// =============================================================================
import React from 'react';
import type { Enemy, Hero, SpellId } from '../../types/game';

interface Props {
  hero: Hero;
  enemy: Enemy;
  onAttack: () => void;
  onUsePotion: () => void;
  onCastSpell: (spell: SpellId) => void;
  disabled: boolean;
}

export const CombatUI: React.FC<Props> = ({ hero, enemy, onAttack, onUsePotion, onCastSpell, disabled }) => {
  const enemyHpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));

  return (
    <div style={{ border: '2px solid #dc3545', padding: '20px', borderRadius: '8px', background: '#2b1b1d', color: '#fff', marginTop: '15px' }}>
      <h3>⚔️ COMBATE: {enemy.name} (Daño: {enemy.attack} | Recompensa: 🪙 {enemy.goldReward})</h3>
      <div style={{ marginBottom: '15px' }}>
        <small>Vida del Enemigo ({enemy.hp} / {enemy.maxHp})</small>
        <div style={{ background: '#444', height: '18px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${enemyHpPercent}%`, background: '#ff4d4d', height: '100%', transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={onAttack} disabled={disabled} style={btnStyle('#dc3545')}>
          ⚔️ Atacar ({hero.attack} daño)
        </button>
        <button onClick={onUsePotion} disabled={disabled || hero.potions <= 0} style={btnStyle(hero.potions > 0 ? '#28a745' : '#555')}>
          🧪 Usar Poción (+50 HP) [{hero.potions}]
        </button>
      </div>

      {hero.heroClass === 'MAGO' && (
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #555' }}>
          <small style={{ display: 'block', marginBottom: '8px' }}>✨ Grimorio del Mago (Maná: {hero.mana}/{hero.maxMana}):</small>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => onCastSpell('BOLA_FUEGO')} disabled={disabled || hero.mana < 30} style={btnStyle('#007bff')}>
              🔥 Bola de Fuego (30 MP)
            </button>
            <button onClick={() => onCastSpell('RAYO')} disabled={disabled || hero.mana < 55} style={btnStyle('#6610f2')}>
              ⚡ Rayo (55 MP)
            </button>
            <button onClick={() => onCastSpell('ESCUDO')} disabled={disabled || hero.mana < 40} style={btnStyle('#17a2b8')}>
              🛡️ Escudo 2 Golpes (40 MP)
            </button>
            <button onClick={() => onCastSpell('ESCAPE')} disabled={disabled || hero.mana < 60} style={btnStyle('#fd7e14')}>
              🌀 Escape Arcano (60 MP)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '9px 14px',
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
});
import React from 'react';
import type { Hero } from '../../types/game';

interface Props {
  hero: Hero;
}

export const HealthManaBar: React.FC<Props> = ({ hero }) => {
  const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
  const manaPercent = Math.max(0, Math.min(100, (hero.mana / hero.maxMana) * 100));

  return (
    <div style={{ padding: '15px', background: '#222', color: '#fff', borderRadius: '8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <strong>Héroe: {hero.name} ({hero.heroClass})</strong>
        <span>🪙 Oro: {hero.gold}</span>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <small>Vida ({hero.hp} / {hero.maxHp})</small>
        <div style={{ background: '#555', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${hpPercent}%`, background: '#dc3545', height: '100%', transition: 'width 0.3s' }} />
        </div>
      </div>

      <div>
        <small>Maná ({hero.mana} / {hero.maxMana})</small>
        <div style={{ background: '#555', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${manaPercent}%`, background: '#007bff', height: '100%', transition: 'width 0.3s' }} />
        </div>
      </div>
    </div>
  );
};
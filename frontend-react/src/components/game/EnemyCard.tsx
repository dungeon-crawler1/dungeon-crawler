// =============================================================================
// TARJETA DE ENEMIGO CON VIDA, HABILIDAD Y ESTADOS
// =============================================================================
import React from 'react';
import type { Enemy } from '../../types/game';

interface Props {
  enemy: Enemy;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
}

const ABILITY_LABELS: Record<string, string> = {
  REVIVE: 'Revive una vez', STUN: 'Puede aturdir', DOUBLE_ATTACK: 'Doble golpe', KAMIKAZE: 'Kamikaze',
  CRITICAL: 'Crítico', EVADE: 'Esquiva', HARD_SKIN: '-30 % daño', ACID: 'Ácido', FIRE: 'Fuego',
  DRAIN: 'Drena vida', ROCKS: 'Rocas', CHARGE: 'Carga eléctrica', REGEN: 'Regenera',
};

export const EnemyCard: React.FC<Props> = ({ enemy, active, disabled, onSelect }) => {
  const hpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
  const dead = enemy.hp <= 0;
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled || dead}
      style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', cursor: dead ? 'default' : 'pointer', border: active ? '2px solid #ffd166' : '1px solid #555', background: dead ? '#222' : active ? '#2b2312' : '#181818', color: dead ? '#777' : '#fff' }}
    >
      <strong>{dead ? '☠️' : enemy.isBoss ? '👑' : enemy.isElite ? '💀' : '⚔️'} {enemy.name}</strong>
      <div style={{ fontSize: '0.78em', color: '#ccc' }}>{enemy.hp} / {enemy.maxHp} HP | Daño {enemy.attack} | 🪙 {enemy.goldReward}</div>
      {enemy.ability && <div style={{ fontSize: '0.72em', color: '#ffd166' }}>{ABILITY_LABELS[enemy.ability] ?? enemy.ability}</div>}
      {enemy.statuses && (enemy.statuses.stunTurns > 0 || enemy.statuses.acidTurns > 0) && (
        <div style={{ fontSize: '0.72em', color: '#8ce99a' }}>
          {enemy.statuses.stunTurns > 0 ? 'Aturdido ' : ''}{enemy.statuses.acidTurns > 0 ? 'Ácido ' : ''}
        </div>
      )}
      <div style={{ background: '#444', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
        <div style={{ width: `${hpPercent}%`, background: '#ff4d4d', height: '100%' }} />
      </div>
      {active && !dead && <div style={{ fontSize: '0.7em', color: '#ffd166', marginTop: '4px' }}>🎯 Objetivo actual</div>}
    </button>
  );
};

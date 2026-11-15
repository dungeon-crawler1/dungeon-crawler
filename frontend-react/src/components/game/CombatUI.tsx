// =============================================================================
// INTERFAZ DE COMBATE POR TURNOS CON GRUPOS, ESTADOS E INVENTARIO
// =============================================================================
import React from 'react';
import type { Enemy, Hero, SpellId } from '../../types/game';
import { calculateHeroPhysicalDamage, heroStatuses, spellCost } from '../../utils/combatLogic';
import { EnemyCard } from './EnemyCard';

interface Props {
  hero: Hero;
  enemies: Enemy[];
  targetIndex: number;
  disabled: boolean;
  onSelectTarget: (index: number) => void;
  onAttack: () => void;
  onUsePotion: (potionId: string) => void;
  onCastSpell: (spell: SpellId) => void;
}

const SPELLS: Array<{ id: SpellId; label: string; color: string }> = [
  { id: 'BOLA_FUEGO', label: '🔥 Bola de Fuego', color: '#007bff' },
  { id: 'RAYO', label: '⚡ Rayo', color: '#6610f2' },
  { id: 'ESCUDO', label: '🛡️ Escudo 2 Golpes', color: '#17a2b8' },
  { id: 'EVASION', label: '💨 Evasión 3 turnos', color: '#20c997' },
  { id: 'FUERZA', label: '💪 Fuerza 5 turnos', color: '#e83e8c' },
  { id: 'ESCAPE', label: '🌀 Escape Arcano', color: '#fd7e14' },
];

const btnStyle = (bg: string): React.CSSProperties => ({ padding: '8px 12px', background: bg, color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' });

export const CombatUI: React.FC<Props> = ({ hero, enemies, targetIndex, disabled, onSelectTarget, onAttack, onUsePotion, onCastSpell }) => {
  const statuses = heroStatuses(hero);
  const { damageBoostPercent, evasionBonus, defenseBonus, blockCharges } = hero.battleBuffs;
  const statusText = [
    statuses.stunTurns > 0 ? 'Aturdido' : '',
    statuses.evasionTurns > 0 ? `Evasión ${statuses.evasionTurns}t` : '',
    statuses.strengthTurns > 0 ? `Fuerza ${statuses.strengthTurns}t` : '',
    statuses.burnTurns > 0 ? `Quemadura ${statuses.burnTurns}t` : '',
    statuses.acidTurns > 0 ? `Ácido ${statuses.acidTurns}t` : '',
  ].filter(Boolean).join(' | ');

  return (
    <div style={{ border: '2px solid #dc3545', padding: '20px', borderRadius: '8px', background: '#2b1b1d', color: '#fff', marginTop: '15px' }}>
      <h3>⚔️ COMBATE ({enemies.filter((enemy) => enemy.hp > 0).length} enemigo(s) en pie)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '12px' }}>
        {enemies.map((enemy, index) => (
          <EnemyCard key={enemy.id ?? index} enemy={enemy} active={index === targetIndex} disabled={disabled} onSelect={() => onSelectTarget(index)} />
        ))}
      </div>

      {(damageBoostPercent > 0 || evasionBonus > 0 || defenseBonus > 0 || blockCharges > 0 || statusText) && (
        <div style={{ padding: '6px 10px', background: '#1c2b1e', borderRadius: '4px', marginBottom: '12px', fontSize: '0.82em', color: '#8ce99a' }}>
          ✨ Efectos activos: {statusText}
          {damageBoostPercent > 0 ? ` [Daño +${Math.round(damageBoostPercent * 100)} %]` : ''}
          {evasionBonus > 0 ? ` [Evasión +${Math.round(evasionBonus * 100)} %]` : ''}
          {defenseBonus > 0 ? ` [Defensa +${Math.round(defenseBonus * 100)} %]` : ''}
          {blockCharges > 0 ? ` [Bloqueo: ${blockCharges}]` : ''}
        </div>
      )}

      <button onClick={onAttack} disabled={disabled || statuses.stunTurns > 0} style={btnStyle('#dc3545')}>
        ⚔️ Atacar ({calculateHeroPhysicalDamage(hero)} daño)
      </button>

      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #555' }}>
        <small style={{ display: 'block', marginBottom: '8px' }}>🧪 Inventario de Pociones:</small>
        {hero.inventory.length === 0 ? <span style={{ fontSize: '0.85em', color: '#aaa' }}>No tenés pociones guardadas.</span> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {hero.inventory.map((potion) => (
              <div key={potion.id} style={{ background: '#181818', border: '1px solid #444', borderRadius: '6px', padding: '8px' }}>
                <strong>{potion.name} (x{potion.quantity})</strong>
                <div style={{ fontSize: '0.78em', color: '#ffd166' }}>⏱️ {potion.durationLabel}</div>
                <p style={{ fontSize: '0.78em', margin: '4px 0 8px', color: '#ccc' }}>{potion.description}</p>
                <button onClick={() => onUsePotion(potion.id)} disabled={disabled} style={btnStyle('#28a745')}>Usar Poción</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {hero.heroClass === 'MAGO' && (
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #555' }}>
          <small style={{ display: 'block', marginBottom: '8px' }}>✨ Grimorio del Mago (Maná: {hero.mana}/{hero.maxMana}):</small>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SPELLS.map((spell) => (
              <button key={spell.id} onClick={() => onCastSpell(spell.id)} disabled={disabled || hero.mana < spellCost(hero, spell.id)} style={btnStyle(spell.color)}>
                {spell.label} ({spellCost(hero, spell.id)} MP)
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

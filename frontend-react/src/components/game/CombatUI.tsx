// =============================================================================
// INTERFAZ DE COMBATE POR TURNOS CON INVENTARIO DE POCIONES Y CÁLCULO DE DAÑO
// =============================================================================
import React from 'react';
import type { Enemy, Hero, SpellId } from '../../types/game';
import { calculateHeroPhysicalDamage } from '../../utils/combatLogic';

interface Props {
  hero: Hero;
  enemy: Enemy;
  onAttack: () => void;
  onUsePotion: (potionId: string) => void;
  onCastSpell: (spell: SpellId) => void;
  disabled: boolean;
}

export const CombatUI: React.FC<Props> = ({ hero, enemy, onAttack, onUsePotion, onCastSpell, disabled }) => {
  const enemyHpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
  const { damageBoostPercent, evasionBonus, defenseBonus, blockCharges } = hero.battleBuffs;
  const effectiveAttackDamage = calculateHeroPhysicalDamage(hero);

  return (
    <div style={{ border: '2px solid #dc3545', padding: '20px', borderRadius: '8px', background: '#2b1b1d', color: '#fff', marginTop: '15px' }}>
      <h3>⚔️ COMBATE: {enemy.name} (Daño: {enemy.attack} | Botín: 🪙 {enemy.goldReward})</h3>
      <div style={{ marginBottom: '12px' }}>
        <small>Vida del Enemigo ({enemy.hp} / {enemy.maxHp})</small>
        <div style={{ background: '#444', height: '18px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${enemyHpPercent}%`, background: '#ff4d4d', height: '100%', transition: 'width 0.3s' }} />
        </div>
      </div>

      {(damageBoostPercent > 0 || evasionBonus > 0 || defenseBonus > 0 || blockCharges > 0) && (
        <div style={{ padding: '6px 10px', background: '#1c2b1e', borderRadius: '4px', marginBottom: '12px', fontSize: '0.82em', color: '#8ce99a' }}>
          ✨ Efectos activos en batalla:
          {damageBoostPercent > 0 && ` [Daño +${Math.round(damageBoostPercent * 100)} %]`}
          {evasionBonus > 0 && ` [Evasión +${Math.round(evasionBonus * 100)} %]`}
          {defenseBonus > 0 && ` [Defensa +${Math.round(defenseBonus * 100)} %]`}
          {blockCharges > 0 && ` [Bloqueo: ${blockCharges} ataque(s)]`}
        </div>
      )}

      <button onClick={onAttack} disabled={disabled} style={btnStyle('#dc3545')}>
        ⚔️ Atacar ({effectiveAttackDamage} daño)
      </button>

      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #555' }}>
        <small style={{ display: 'block', marginBottom: '8px' }}>🧪 Inventario de Pociones:</small>
        {hero.inventory.length === 0 ? (
          <span style={{ fontSize: '0.85em', color: '#aaa' }}>No tienes pociones guardadas en tu inventario.</span>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {hero.inventory.map((pot) => (
              <div key={pot.id} style={{ background: '#181818', border: '1px solid #444', borderRadius: '6px', padding: '8px' }}>
                <strong>{pot.name} (x{pot.quantity})</strong>
                <div style={{ fontSize: '0.78em', color: '#ffd166' }}>⏱️ Duración: {pot.durationLabel}</div>
                <p style={{ fontSize: '0.78em', margin: '4px 0 8px', color: '#ccc' }}>{pot.description}</p>
                <button onClick={() => onUsePotion(pot.id)} disabled={disabled} style={btnStyle('#28a745')}>Usar Poción</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {hero.heroClass === 'MAGO' && (
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #555' }}>
          <small style={{ display: 'block', marginBottom: '8px' }}>✨ Grimorio del Mago (Maná: {hero.mana}/{hero.maxMana}):</small>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => onCastSpell('BOLA_FUEGO')} disabled={disabled || hero.mana < 30} style={btnStyle('#007bff')}>🔥 Bola de Fuego (30 MP)</button>
            <button onClick={() => onCastSpell('RAYO')} disabled={disabled || hero.mana < 55} style={btnStyle('#6610f2')}>⚡ Rayo (55 MP)</button>
            <button onClick={() => onCastSpell('ESCUDO')} disabled={disabled || hero.mana < 40} style={btnStyle('#17a2b8')}>🛡️ Escudo 2 Golpes (40 MP)</button>
            <button onClick={() => onCastSpell('ESCAPE')} disabled={disabled || hero.mana < 60} style={btnStyle('#fd7e14')}>🌀 Escape Arcano (60 MP)</button>
          </div>
        </div>
      )}
    </div>
  );
};

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '8px 12px', background: bg, color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer',
});
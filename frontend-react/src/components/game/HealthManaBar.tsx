// =============================================================================
// HUD SUPERIOR: ESTADÍSTICAS, TOOLTIP (...) DE PORCENTAJES Y DESPLEGABLE DE RELIQUIAS
// =============================================================================
import React, { useState } from 'react';
import type { Hero } from '../../types/game';
import { RelicsDropdown } from './RelicsDropdown';
import { heroStatuses, totalBlockChance, totalDamagePercent, totalEvasion, totalReduction } from '../../utils/combatLogic';

interface Props {
  hero: Hero;
  room: number;
  score: number;
  onForfeit: () => void;
  onRequestLeave: () => void;
  disabled: boolean;
}

export const HealthManaBar: React.FC<Props> = ({ hero, room, score, onForfeit, onRequestLeave, disabled }) => {
  const [showModifiers, setShowModifiers] = useState<boolean>(false);

  const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
  const manaPercent = hero.maxMana > 0 ? Math.max(0, Math.min(100, (hero.mana / hero.maxMana) * 100)) : 0;
  const totalPotions = hero.inventory.reduce((sum, p) => sum + p.quantity, 0);

  // Cálculo de porcentajes activos para el tooltip (...)
  const totalDamagePct = Math.round(totalDamagePercent(hero) * 100);
  const totalMaxHpPct = Math.round(hero.percentMaxHpBonus * 100);
  const totalReductionPct = Math.round(totalReduction(hero) * 100);
  const totalEvasionPct = Math.round(totalEvasion(hero) * 100);
  const blockPct = Math.round(totalBlockChance(hero) * 100);
  const extraGoldPct = Math.round((hero.goldMultiplier - 1) * 100);
  const discountPct = Math.round(hero.shopDiscount * 100);
  const statuses = heroStatuses(hero);
  const statusText = [
    statuses.stunTurns > 0 ? 'Aturdido' : '',
    statuses.evasionTurns > 0 ? `Evasión ${statuses.evasionTurns}t` : '',
    statuses.strengthTurns > 0 ? `Fuerza ${statuses.strengthTurns}t` : '',
    statuses.burnTurns > 0 ? `Quemadura ${statuses.burnTurns}t` : '',
    statuses.acidTurns > 0 ? `Ácido ${statuses.acidTurns}t` : '',
  ].filter(Boolean).join(' | ');

  return (
    <div style={{ padding: '15px', background: '#222', color: '#fff', borderRadius: '8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <strong>{hero.name}</strong> | 🚪 Sala #{room} | 🏆 Puntos: <strong>{score}</strong> | 🪙 Monedas: <strong>{hero.gold}</strong> | 🧪 Pociones: <strong>{totalPotions}</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onForfeit} disabled={disabled} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            🏳️ Terminar Partida
          </button>
          <button onClick={onRequestLeave} disabled={disabled} style={{ padding: '6px 12px', background: '#495057', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            🏠 Volver al Inicio
          </button>
        </div>
      </div>

      <div style={{ marginBottom: hero.maxMana > 0 ? '8px' : '0', position: 'relative' }}>
        <small>
          Vida ({hero.hp} / {hero.maxHp}) | ⚔️ Ataque: {hero.attack} | 🛡️ Reducción: {totalReductionPct} %{' '}
          <span
            onMouseEnter={() => setShowModifiers(true)}
            onMouseLeave={() => setShowModifiers(false)}
            style={{ display: 'inline-block', padding: '0 6px', marginLeft: '4px', background: '#3a3f45', color: '#ffd166', borderRadius: '4px', cursor: 'help', fontWeight: 'bold', letterSpacing: '1px' }}
          >
            ...
          </span>
        </small>

        {showModifiers && (
          <div style={{ position: 'absolute', top: '22px', left: '120px', zIndex: 50, background: '#111315', border: '1px solid #ffd166', borderRadius: '6px', padding: '10px 14px', minWidth: '280px', fontSize: '0.8em', boxShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>
            <strong style={{ color: '#ffd166', display: 'block', marginBottom: '6px' }}>📊 Modificadores y Porcentajes del Jugador</strong>
            <div>❤️ Vida Base: {hero.baseMaxHp} (+{hero.flatMaxHpBonus} suma) | Bono Vida: +{totalMaxHpPct} %</div>
            <div>⚔️ Daño Base: {hero.baseAttack} (+{hero.flatAttackBonus} suma) | Daño Extra: +{totalDamagePct} %</div>
            <div>🛡️ Reducción de Daño: {totalReductionPct} %</div>
            <div>🛡️ Prob. de Bloqueo: {blockPct} %</div>
            <div>💨 Prob. Evasión: {totalEvasionPct} %</div>
            <div>🪙 Monedas Extra: +{extraGoldPct} %</div>
            <div>🏷️ Descuento en Mercaderes: -{discountPct} %</div>
            <div>🗿 Estatua: {hero.statueBonus ?? 'Sin activar'}</div>
            {(hero.lifestealOnKill ?? 0) > 0 && (
              <div>🩸 Regeneración al eliminar: {Math.round((hero.lifestealOnKill ?? 0) * 100)} % de vida máxima</div>
            )}
            {hero.relics.some((relic) => relic.id === 'boss-drac') && (
              <div>🩸 Vampirismo Completo: cura vida al eliminar (100 %, 50 %, 25 %…)</div>
            )}
            {(hero.maxHpPerKill ?? 0) > 0 && (
              <div>🌱 Vida máxima: +{Math.round((hero.maxHpPerKill ?? 0) * 100)} % por enemigo derrotado</div>
            )}
          </div>
        )}

        <div style={{ background: '#555', height: '14px', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
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

      {statusText && <div style={{ fontSize: '0.8em', color: '#ffd166', marginTop: '6px' }}>✨ {statusText}</div>}
      <RelicsDropdown relics={hero.relics} />
    </div>
  );
};
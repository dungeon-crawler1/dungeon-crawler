// =============================================================================
// UTILIDADES PURAS DE RESOLUCIÓN DE COMBATE, PASIVAS Y EVENTOS
// =============================================================================
import type { Enemy, GameEvent, Hero, ShopItem } from '../types/game';

export const MERCHANT_CATALOG: ShopItem[] = [
  { id: 'pot-small', name: 'Frasco de Curación Pequeño', type: 'POCION', price: 30, hpRestore: 50, attackBonus: 0, description: 'Regenera 50 puntos de vida.' },
  { id: 'pot-med', name: 'Poción Media de Curación', type: 'POCION', price: 50, hpRestore: 80, attackBonus: 0, description: 'Regenera 80 puntos de vida.' },
  { id: 'rel-sharp', name: 'Afilador de Acero', type: 'RELIQUIA', price: 120, hpRestore: 0, attackBonus: 10, description: 'Aumenta permanentemente tu daño (+10).' },
];

// Calcula el daño físico del héroe aplicando la pasiva del Bárbaro (< 50% HP)
export function calculateHeroPhysicalDamage(hero: Hero): number {
  const isEnraged = hero.heroClass === 'BARBARO' && hero.hp < hero.maxHp * 0.5;
  return isEnraged ? Math.round(hero.attack * 1.4) : hero.attack;
}

// Calcula el daño recibido considerando Escudo Arcano y pasivas de Caballero/Pícaro
export function calculateEnemyCounterAttack(hero: Hero, enemy: Enemy): {
  damageTaken: number;
  remainingShields: number;
  note: string;
} {
  if (hero.shieldCharges > 0) {
    return { damageTaken: 0, remainingShields: hero.shieldCharges - 1, note: ' (bloqueado por Escudo Arcano)' };
  }
  if (hero.heroClass === 'CABALLERO' && Math.random() < 0.2) {
    return { damageTaken: 0, remainingShields: 0, note: ' (bloqueado con escudo)' };
  }
  if (hero.heroClass === 'PICARO' && Math.random() < 0.2) {
    return { damageTaken: 0, remainingShields: 0, note: ' (esquivado)' };
  }
  const reduced = hero.heroClass === 'CABALLERO' ? Math.round(enemy.attack * 0.8) : enemy.attack;
  return { damageTaken: reduced, remainingShields: 0, note: '' };
}

// Calcula monedas ganadas al vencer (incluye +25% pasivo del Pícaro)
export function calculateGoldReward(hero: Hero, enemy: Enemy): number {
  const multiplier = hero.heroClass === 'PICARO' ? 1.25 : 1;
  return Math.round(enemy.goldReward * multiplier);
}

// Aplica los efectos de eventos especiales (Fuente de los Deseos, Estatua, Ayuda, Tesoro)
export function applyEventEffect(hero: Hero, event: GameEvent, accepted: boolean): Hero {
  const next = { ...hero };
  if (!accepted) return next;

  if (event.type === 'TREASURE') {
    next.gold += 75;
  } else if (event.type === 'HELP_ROOM') {
    next.hp = Math.min(next.maxHp, next.hp + 30);
    next.mana = Math.min(next.maxMana, next.mana + 30);
  } else if (event.type === 'WISH_FOUNTAIN' && next.gold >= 1) {
    next.gold -= 1;
    if (Math.random() < 0.05) next.attack += 15;
  } else if (event.type === 'STATUE' && !next.statueUsed) {
    next.statueUsed = true;
    next.attack += 12;
  }
  return next;
}
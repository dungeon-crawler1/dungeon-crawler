// =============================================================================
// UTILIDADES DE RESOLUCIÓN DE PUERTAS, SALAS MISTERIOSAS Y EVENTOS ESPECIALES
// =============================================================================
import type { Door, GameEvent, Hero, RoomEventType } from '../types/game';
import { buildMerchantStock } from '../data/gameCatalog';
import { spawnEnemyForRoom } from '../services/gameService';
import { recalculateHeroStats } from './combatLogic';

// Resuelve la puerta elegida (revelando Salas Misteriosas) y prepara el encuentro
export function resolveDoorEncounter(door: Door, hero: Hero, score: number) {
  const mysteryPool: Exclude<RoomEventType, 'MYSTERY'>[] = score > 10
    ? ['COMBAT', 'ELITE', 'MERCHANT', 'LUXURY_MERCHANT', 'WISH_FOUNTAIN', 'STATUE', 'HELP_ROOM', 'TREASURE']
    : ['COMBAT', 'MERCHANT', 'WISH_FOUNTAIN', 'STATUE', 'HELP_ROOM', 'TREASURE'];
  const resolved: Exclude<RoomEventType, 'MYSTERY'> = door.type === 'MYSTERY'
    ? mysteryPool[Math.floor(Math.random() * mysteryPool.length)] : door.type;
  const note = door.type === 'MYSTERY' ? `❓ Sala Misteriosa reveló: ${resolved}. ` : '';

  if (resolved === 'COMBAT' || resolved === 'ELITE' || resolved === 'BOSS') {
    const enemy = spawnEnemyForRoom(resolved, hero.defeatedBosses);
    return { inCombat: true, enemy, merchantItems: [], isLuxuryMerchant: false, currentEvent: null, log: `${note}Entraste a ${door.title}: aparece ${enemy.name} (${enemy.hp} HP).` };
  }
  if (resolved === 'MERCHANT' || resolved === 'LUXURY_MERCHANT') {
    const isLuxury = resolved === 'LUXURY_MERCHANT';
    const stock = buildMerchantStock(isLuxury, hero.relics, hero.shopDiscount);
    return { inCombat: false, enemy: null, merchantItems: stock, isLuxuryMerchant: isLuxury, currentEvent: null, log: `${note}Entraste al ${isLuxury ? 'Mercader de Lujo' : 'Mercader Común'}.` };
  }
  return { inCombat: false, enemy: null, merchantItems: [], isLuxuryMerchant: false, currentEvent: { title: door.title, description: door.description, type: resolved }, log: `${note}Entraste a ${door.title}.` };
}

// Aplica los efectos de eventos especiales (Tesoro, Ayuda, Fuente y Estatua)
export function applyEventEffect(hero: Hero, event: GameEvent, accepted: boolean): { hero: Hero; message: string } {
  const next = { ...hero };
  if (!accepted) return { hero: next, message: `Ignoraste ${event.title} y continuaste tu camino.` };

  if (event.type === 'TREASURE') {
    const coins = Math.floor(Math.random() * 61) + 60;
    next.gold += coins;
    return { hero: next, message: `💰 Sala del Tesoro: abriste el cofre y obtuviste +${coins} monedas.` };
  }
  if (event.type === 'HELP_ROOM') {
    if (next.heroClass === 'MAGO') {
      next.mana = Math.min(next.maxMana, next.mana + 30);
      next.hp = Math.min(next.maxHp, next.hp + 20);
      return { hero: next, message: '✨ Estanque Mágico: recuperaste +30 Maná y +20 HP.' };
    }
    next.hp = Math.min(next.maxHp, next.hp + 40);
    return { hero: next, message: '🔥 Cabaña Acogedora: descansaste y recuperaste +40 HP.' };
  }
  if (event.type === 'WISH_FOUNTAIN') {
    if (next.gold < 1) return { hero: next, message: '⛲ Fuente de los Deseos: no tenías monedas para arrojar.' };
    next.gold -= 1;
    if (Math.random() < 0.05) {
      const roll = Math.floor(Math.random() * 4);
      if (roll === 0) { next.percentMaxHpBonus += 0.3; return { hero: recalculateHeroStats(next), message: '⛲ ¡DESEO CONCEDIDO! (+5 %): +30 % Vida Máxima sobre tu base total.' }; }
      if (roll === 1) { next.percentAttackBonus += 0.4; return { hero: recalculateHeroStats(next), message: '⛲ ¡DESEO CONCEDIDO! (+5 %): +40 % Daño permanente sobre tu base total.' }; }
      if (roll === 2) { next.damageReduction = Math.min(0.75, next.damageReduction + 0.2); return { hero: next, message: '⛲ ¡DESEO CONCEDIDO! (+5 %): -20 % daño recibido permanente.' }; }
      next.shopDiscount = Math.min(0.6, next.shopDiscount + 0.2);
      return { hero: next, message: '⛲ ¡DESEO CONCEDIDO! (+5 %): -20 % descuento en mercaderes.' };
    }
    return { hero: next, message: '⛲ Fuente de los Deseos: arrojaste 1 moneda, pero no recibiste buff (95 % sin efecto).' };
  }
  if (next.statueUsed) return { hero: next, message: '🗿 Estatua Sagrada: ya activaste una estatua en esta partida (máx. 1 por partida).' };
  next.statueUsed = true;
  if (next.heroClass === 'CABALLERO') { next.damageReduction = Math.max(next.damageReduction, 0.4); return { hero: next, message: '🗿 Estatua Real activada: reducción de daño sube al 40 %.' }; }
  if (next.heroClass === 'BARBARO') { next.percentAttackBonus += 0.4; return { hero: recalculateHeroStats(next), message: '🗿 Estatua Barbárica activada: +40 % de daño sobre tu base total.' }; }
  if (next.heroClass === 'PICARO') { next.evasionChance = 0.3; next.goldMultiplier += 0.15; return { hero: next, message: '🗿 Estatua Escurridiza activada: 30 % evasión y +40 % monedas extra.' }; }
  next.maxMana += 50; next.mana += 50; next.flatAttackBonus += 15;
  return { hero: recalculateHeroStats(next), message: '🗿 Estatua Mágica activada: +50 Maná máximo y +15 Daño base (suma).' };
}
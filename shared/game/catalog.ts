// =============================================================================
// CATÁLOGOS DE POCIONES Y RELIQUIAS (BONOS PLANOS VS. PORCENTUALES)
// =============================================================================
import type { EquippedRelic, ShopItem } from './types';

const COMMON_HEALING_POTIONS: ShopItem[] = [
  { id: 'pot-heal-sm', name: 'Frasco de Curación Pequeño', type: 'POCION', price: 30, effectType: 'HEAL', effectValue: 50, durationLabel: 'Instantáneo', effectSummary: '+50 HP', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Regenera +50 HP al usarse.' },
  { id: 'pot-heal-md', name: 'Poción Media de Curación', type: 'POCION', price: 50, effectType: 'HEAL', effectValue: 80, durationLabel: 'Instantáneo', effectSummary: '+80 HP', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Regenera +80 HP al usarse.' },
];

const COMMON_UTILITY_POTIONS: ShopItem[] = [
  { id: 'pot-str', name: 'Poción de Fuerza Pequeña', type: 'POCION', price: 50, effectType: 'DAMAGE_BOOST', effectValue: 0.3, durationLabel: 'Toda la batalla', effectSummary: '+30 % Daño', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Aumenta todo el daño un +30 % durante el resto de la batalla.' },
  { id: 'pot-eva', name: 'Poción de Evasión', type: 'POCION', price: 45, effectType: 'EVASION_BOOST', effectValue: 0.3, durationLabel: 'Toda la batalla', effectSummary: '+30 % Evasión', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Otorga +30 % de probabilidad de esquivar durante la batalla.' },
  { id: 'pot-def', name: 'Poción de Defensa', type: 'POCION', price: 60, effectType: 'DEFENSE_BOOST', effectValue: 0.4, durationLabel: 'Toda la batalla', effectSummary: '+40 % Defensa', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Reduce el daño recibido un 40 % durante la batalla.' },
  { id: 'pot-blk', name: 'Poción de Bloqueo', type: 'POCION', price: 70, effectType: 'BLOCK_ATTACKS', effectValue: 2, durationLabel: '2 ataques', effectSummary: 'Bloquea 2 golpes', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Bloquea por completo los siguientes 2 ataques recibidos.' },
];

const COMMON_RELICS: ShopItem[] = [
  { id: 'rel-magnet', name: 'Imán de Oro', type: 'RELIQUIA', price: 150, effectValue: 0, durationLabel: 'Permanente', effectSummary: '+30 % Monedas extra', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0.3, discountBonus: 0, description: 'Aumenta en +30 % las monedas conseguidas en combates.' },
  { id: 'rel-sharp', name: 'Afilador', type: 'RELIQUIA', price: 120, effectValue: 0, durationLabel: 'Permanente', effectSummary: '+15 % Daño (no magos)', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Aumenta un +15 % el daño infligido. No tiene efecto en magos.' },
  { id: 'rel-crystal', name: 'Bola de Cristal', type: 'RELIQUIA', price: 130, effectValue: 0, durationLabel: 'Permanente', effectSummary: '+30 % Maná máximo (magos)', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, percentMaxManaBonus: 0.3, description: 'Aumenta la cantidad de maná máximo un +30 %. Solo funciona en magos.' },
  { id: 'rel-shield', name: 'Escudo de Acero', type: 'RELIQUIA', price: 140, effectValue: 0, durationLabel: 'Permanente', effectSummary: '-25 % Daño recibido', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0.25, goldBonus: 0, discountBonus: 0, description: 'Disminuye el daño recibido en un 25 %.' },
  { id: 'rel-medal', name: 'Medalla de Mercader', type: 'RELIQUIA', price: 160, effectValue: 0, durationLabel: 'Permanente', effectSummary: '-10 % Precios tienda', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0.1, description: 'Otorga 10 % de descuento en todos los mercaderes.' },
  { id: 'rel-vampire', name: 'Anillo Vampírico', type: 'RELIQUIA', price: 170, effectValue: 0, durationLabel: 'Permanente', effectSummary: 'Cura 4 % al eliminar', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Al eliminar un enemigo recupera un 4 % de la vida máxima.' },
  { id: 'rel-life', name: 'Piedra de la Vida', type: 'RELIQUIA', price: 125, effectValue: 0, durationLabel: 'Permanente', effectSummary: '+20 % Vida máxima', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0.2, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Aumenta la vida máxima un +20 % sobre la base total.' },
];

const LUXURY_HEALING_POTIONS: ShopItem[] = [
  { id: 'lux-heal-lg', name: 'Poción Grande de Curación', type: 'POCION', price: 80, effectType: 'HEAL_FULL', effectValue: 999, durationLabel: 'Instantáneo', effectSummary: 'Cura 100 % HP', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Regenera toda tu vida restante al máximo.' },
];

const LUXURY_UTILITY_POTIONS: ShopItem[] = [
  { id: 'lux-str', name: 'Súper Poción de Fuerza', type: 'POCION', price: 100, effectType: 'DAMAGE_BOOST', effectValue: 0.5, durationLabel: 'Toda la batalla', effectSummary: '+50 % Daño', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Aumenta todo el daño un +50 % durante la batalla.' },
  { id: 'lux-def', name: 'Súper Poción de Defensa', type: 'POCION', price: 110, effectType: 'DEFENSE_BOOST', effectValue: 0.6, durationLabel: 'Toda la batalla', effectSummary: '+60 % Defensa', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Reduce el daño recibido un 60 % durante la batalla.' },
  { id: 'lux-eva', name: 'Súper Poción de Evasión', type: 'POCION', price: 90, effectType: 'EVASION_BOOST', effectValue: 0.4, durationLabel: 'Toda la batalla', effectSummary: '+40 % Evasión', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Otorga +40 % de probabilidad de esquivar durante la batalla.' },
  { id: 'lux-blk', name: 'Súper Poción de Bloqueo', type: 'POCION', price: 100, effectType: 'BLOCK_ATTACKS', effectValue: 3, durationLabel: '3 ataques', effectSummary: 'Bloquea 3 golpes', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Bloquea por completo los siguientes 3 ataques recibidos.' },
  { id: 'lux-escape', name: 'Poción de Escape', type: 'POCION', price: 130, effectType: 'ESCAPE_ROOM', effectValue: 0, durationLabel: 'Instantáneo', effectSummary: 'Vuelve a elegir puerta', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Sale de la habitación actual para volver a elegir el camino.' },
];

const LUXURY_RELICS: ShopItem[] = [
  { id: 'lux-midas', name: 'Mano de Midas', type: 'RELIQUIA', price: 500, effectValue: 0, durationLabel: 'Permanente', effectSummary: '+50 % Monedas extra', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0.5, discountBonus: 0, description: 'Aumenta en +50 % todas las monedas obtenidas.' },
  { id: 'lux-essence', name: 'Esencia Vampírica', type: 'RELIQUIA', price: 550, effectValue: 0, durationLabel: 'Permanente', effectSummary: '+5 % Vida máxima por enemigo', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Aumenta la vida máxima un 5 % por cada enemigo derrotado.' },
  { id: 'lux-bless', name: 'Bendición del Atacante', type: 'RELIQUIA', price: 520, effectValue: 0, durationLabel: 'Permanente', effectSummary: '+40 % Daño total', flatAttackBonus: 0, percentAttackBonus: 0.4, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Aumenta en +40 % todo el daño infligido.' },
  { id: 'lux-helm', name: 'Casco del Emperador', type: 'RELIQUIA', price: 470, effectValue: 0, durationLabel: 'Permanente', effectSummary: '-40 % Daño recibido', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0.4, goldBonus: 0, discountBonus: 0, description: 'Disminuye el daño recibido en un 40 %.' },
  { id: 'lux-merlin', name: 'Capa de Merlin', type: 'RELIQUIA', price: 450, effectValue: 0, durationLabel: 'Permanente', effectSummary: '+50 % Maná máximo', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, percentMaxManaBonus: 0.5, description: 'Aumenta un +50 % el maná máximo.' },
  { id: 'lux-emblem', name: 'Emblema del Mercader', type: 'RELIQUIA', price: 600, effectValue: 0, durationLabel: 'Permanente', effectSummary: '-30 % Precios tienda', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0.3, description: 'Reduce los precios de mercaderes en un 30 %.' },
  { id: 'lux-telescope', name: 'Telescopio Transfísico', type: 'RELIQUIA', price: 650, effectValue: 0, durationLabel: 'Permanente', effectSummary: 'Revela el contenido de las puertas', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'Permite ver qué habitación y enemigos hay antes de elegir.' },
  { id: 'lux-berserker', name: 'Sangre del Berserker', type: 'RELIQUIA', price: 550, effectValue: 0, durationLabel: 'Permanente', effectSummary: '+50 % Daño en el primer turno', flatAttackBonus: 0, percentAttackBonus: 0, flatMaxHpBonus: 0, percentMaxHpBonus: 0, reductionBonus: 0, goldBonus: 0, discountBonus: 0, description: 'El daño infligido en el primer turno de cada combate es 50 % mayor.' },
];

// Genera una poción de curación + una utilidad + una reliquia única disponible.
export function buildMerchantStock(isLuxury: boolean, ownedRelics: EquippedRelic[], discount: number): ShopItem[] {
  const healPool = isLuxury ? LUXURY_HEALING_POTIONS : COMMON_HEALING_POTIONS;
  const utilPool = isLuxury ? LUXURY_UTILITY_POTIONS : COMMON_UTILITY_POTIONS;
  const relicPool = isLuxury ? LUXURY_RELICS : COMMON_RELICS;

  const healPick = healPool[Math.floor(Math.random() * healPool.length)];
  const utilPick = utilPool[Math.floor(Math.random() * utilPool.length)];
  const availableRelics = relicPool.filter((relic) => !ownedRelics.some((owned) => owned.name === relic.name));
  const relicPick = availableRelics.length > 0 ? [availableRelics[Math.floor(Math.random() * availableRelics.length)]] : [];

  return [healPick, utilPick, ...relicPick].map((item) => ({
    ...item,
    price: Math.max(5, Math.round(item.price * (1 - Math.min(0.6, discount)))),
  }));
}

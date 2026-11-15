// =============================================================================
// RESOLUCIÓN DE PUERTAS, SALAS MISTERIOSAS Y EVENTOS ESPECIALES
// =============================================================================
import type { Door, Enemy, GameEvent, Hero, HeroClassId, RoomEventType, ShopItem } from './types';
import { buildMerchantStock } from './catalog';
import { spawnEncounterForRoom } from './gameContent';
import { applyShopPurchase, recalculateHeroStats } from './combatLogic';

type ResolvedType = Exclude<RoomEventType, 'MYSTERY'>;

export interface Encounter {
  inCombat: boolean;
  enemy: Enemy | null;
  enemies: Enemy[];
  merchantItems: ShopItem[];
  isLuxuryMerchant: boolean;
  currentEvent: GameEvent | null;
  log: string;
}

const EARLY_MYSTERY: ResolvedType[] = ['COMBAT', 'MERCHANT', 'WISH_FOUNTAIN', 'STATUE', 'HELP_ROOM', 'TREASURE'];
const LATE_MYSTERY: ResolvedType[] = ['COMBAT', 'ELITE', 'MERCHANT', 'LUXURY_MERCHANT', 'WISH_FOUNTAIN', 'STATUE', 'HELP_ROOM', 'TREASURE'];

const STATUE_NAMES: Record<HeroClassId, string> = {
  CABALLERO: 'Estatua Real',
  BARBARO: 'Estatua Barbárica',
  PICARO: 'Estatua Escurridiza',
  MAGO: 'Estatua Mágica',
};

const CLASS_LABELS: Record<HeroClassId, string> = {
  CABALLERO: 'Caballero',
  BARBARO: 'Bárbaro',
  PICARO: 'Pícaro',
  MAGO: 'Mago',
};

type HelpType = 'HOGUERA' | 'CABANA' | 'ESTANQUE' | 'COMEDOR';

const HELP_DESCRIPTIONS: Record<HelpType, string> = {
  HOGUERA: 'Hoguera: descansá y regenerá 20 puntos de vida.',
  CABANA: 'Cabaña Acogedora: descansá y regenerá 40 puntos de vida.',
  ESTANQUE: 'Estanque Mágico: solo los magos regeneran 30 puntos de maná.',
  COMEDOR: 'Comedor: pagá 15 monedas para regenerar 40 puntos de vida.',
};

const HELP_SUMMARIES: Record<HelpType, string> = {
  HOGUERA: 'Hoguera: +20 HP',
  CABANA: 'Cabaña Acogedora: +40 HP',
  ESTANQUE: 'Estanque Mágico: +30 maná (mago)',
  COMEDOR: 'Comedor: 15 monedas → +40 HP',
};

const STATUE_SUMMARIES: Record<HeroClassId, string> = {
  CABALLERO: 'Estatua Real (Caballero): -40 % daño recibido',
  BARBARO: 'Estatua Barbárica (Bárbaro): +40 % daño',
  PICARO: 'Estatua Escurridiza (Pícaro): 30 % evasión y +40 % monedas',
  MAGO: 'Estatua Mágica (Mago): hechizos a mitad de costo',
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickStatues(heroClass?: HeroClassId): HeroClassId[] {
  const classes: HeroClassId[] = ['CABALLERO', 'BARBARO', 'PICARO', 'MAGO'];
  if (!heroClass) {
    const shuffled = [...classes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.random() < 0.5 ? 1 : 2);
  }
  const others = classes.filter((item) => item !== heroClass);
  return Math.random() < 0.5 ? [heroClass] : [heroClass, pick(others)];
}

function helpTypes(heroClass?: HeroClassId): HelpType[] {
  const all: HelpType[] = ['HOGUERA', 'CABANA', 'ESTANQUE', 'COMEDOR'];
  return heroClass && heroClass !== 'MAGO' ? all.filter((type) => type !== 'ESTANQUE') : all;
}

function mysteryType(score: number, hero: Hero): ResolvedType {
  const remainingBosses = 6 - hero.defeatedBosses.length;
  const pool = [...(score > 10 ? LATE_MYSTERY : EARLY_MYSTERY)];
  if (score >= 20 && score % 10 === 0 && remainingBosses > 0) pool.push('BOSS');
  return pick(pool);
}

export function buildEvent(type: GameEvent['type'], heroClass?: HeroClassId): GameEvent | null {
  if (type === 'STATUE') {
    const statues = pickStatues(heroClass);
    const names = statues.map((item) => `${STATUE_NAMES[item]} (${CLASS_LABELS[item]})`).join(' y ');
    return { title: 'Estatuas Sagradas', description: `Encontraste ${names}. Solo podés activar la de tu clase, una vez por partida.`, type, statues };
  }
  if (type === 'HELP_ROOM') {
    const helpType = pick(helpTypes(heroClass));
    return { title: 'Sala de Ayuda', description: HELP_DESCRIPTIONS[helpType], type, helpType, cost: helpType === 'COMEDOR' ? 15 : 0 };
  }
  if (type === 'TREASURE') return { title: 'Sala del Tesoro', description: 'Abriste un cofre con monedas y un objeto.', type };
  return { title: 'Fuente de los Deseos', description: 'Arroja 1 moneda: 5 % de probabilidad de un buff permanente.', type };
}

function eventPreview(event: GameEvent): string {
  if (event.type === 'STATUE') return `🗿 ${(event.statues ?? []).map((item) => `${STATUE_NAMES[item]} (${CLASS_LABELS[item]})`).join(' / ')}`;
  if (event.type === 'HELP_ROOM' && event.helpType) return `✨ ${HELP_SUMMARIES[event.helpType]}`;
  return `✨ ${event.title}: ${event.description}`;
}

interface BuildContext {
  door: Door;
  hero: Hero;
  score: number;
  note: string;
}

function buildCombat(type: ResolvedType, ctx: BuildContext): Encounter {
  const enemies = spawnEncounterForRoom(type as 'COMBAT' | 'ELITE' | 'BOSS', ctx.hero.defeatedBosses, ctx.score);
  const names = enemies.map((enemy) => `${enemy.name} (${enemy.hp} HP)`).join(', ');
  return { inCombat: true, enemy: enemies[0], enemies, merchantItems: [], isLuxuryMerchant: false, currentEvent: null, log: `${ctx.note}Entraste a ${ctx.door.title}: ${names}.` };
}

function buildMerchant(isLuxury: boolean, ctx: BuildContext): Encounter {
  const stock = buildMerchantStock(isLuxury, ctx.hero.relics, ctx.hero.shopDiscount);
  const nombre = isLuxury ? 'Mercader de Lujo' : 'Mercader Común';
  return { inCombat: false, enemy: null, enemies: [], merchantItems: stock, isLuxuryMerchant: isLuxury, currentEvent: null, log: `${ctx.note}Entraste al ${nombre}.` };
}

function build(type: ResolvedType, ctx: BuildContext): Encounter {
  if (type === 'COMBAT' || type === 'ELITE' || type === 'BOSS') return buildCombat(type, ctx);
  if (type === 'MERCHANT' || type === 'LUXURY_MERCHANT') return buildMerchant(type === 'LUXURY_MERCHANT', ctx);
  const currentEvent = buildEvent(type as GameEvent['type'], ctx.hero.heroClass);
  return { inCombat: false, enemy: null, enemies: [], merchantItems: [], isLuxuryMerchant: false, currentEvent, log: `${ctx.note}Entraste a ${ctx.door.title}.` };
}

export function encounterPreview(encounter: Encounter): string {
  if (encounter.inCombat) return `👁️ ${encounter.enemies.length} enemigo(s): ${encounter.enemies.map((enemy) => `${enemy.name} (${enemy.hp} HP)`).join(', ')}`;
  if (encounter.merchantItems.length > 0) return `👁️ ${encounter.isLuxuryMerchant ? 'Mercader de Lujo' : 'Mercader Común'}: ${encounter.merchantItems.map((item) => item.name).join(', ')}`;
  return `👁️ ${encounter.currentEvent ? eventPreview(encounter.currentEvent) : 'Evento'}`;
}

// Estatuas y salas de ayuda muestran su contenido siempre; el Telescopio revela el resto.
export function attachDoorPreviews(doors: Door[], hero: Hero, score: number): Door[] {
  return doors.map((door) => {
    if (door.type === 'STATUE' || door.type === 'HELP_ROOM') {
      const event = buildEvent(door.type, hero.heroClass);
      return event ? { ...door, previewData: { event }, preview: eventPreview(event) } : door;
    }
    if (!hero.previewEnabled) return door;
    const type = door.type === 'MYSTERY' ? mysteryType(score, hero) : door.type;
    if (type === 'STATUE' || type === 'HELP_ROOM') {
      const event = buildEvent(type, hero.heroClass);
      if (event) return { ...door, previewData: { event }, preview: `❓ ${eventPreview(event)}` };
    }
    const note = door.type === 'MYSTERY' ? `❓ La sala misteriosa revela ${type}. ` : '';
    const encounter = build(type, { door, hero, score, note });
    return { ...door, previewData: { enemies: encounter.enemies, merchantItems: encounter.merchantItems, isLuxuryMerchant: encounter.isLuxuryMerchant, event: encounter.currentEvent ?? undefined }, preview: encounterPreview(encounter) };
  });
}

function fromPreview(door: Door): Encounter {
  const { enemies = [], merchantItems = [], isLuxuryMerchant = false, event = null } = door.previewData ?? {};
  return {
    inCombat: enemies.length > 0,
    enemy: enemies[0] ?? null,
    enemies,
    merchantItems,
    isLuxuryMerchant,
    currentEvent: event,
    log: `Entraste a ${door.title}.`,
  };
}

export function resolveDoorEncounter(door: Door, hero: Hero, score: number): Encounter {
  if (door.previewData) return fromPreview(door);
  const type = door.type === 'MYSTERY' ? mysteryType(score, hero) : door.type;
  const note = door.type === 'MYSTERY' ? `❓ La sala misteriosa revela ${type}. ` : '';
  return build(type, { door, hero, score, note });
}

function grantItem(hero: Hero, item: ShopItem): { hero: Hero; message: string } {
  if (item.type === 'RELIQUIA') {
    return { hero: applyShopPurchase(hero, { ...item, price: 0 }), message: `🏺 Obtuviste la reliquia [${item.name}].` };
  }
  const existing = hero.inventory.find((potion) => potion.id === item.id);
  const inventory = existing
    ? hero.inventory.map((potion) => (potion.id === item.id ? { ...potion, quantity: potion.quantity + 1 } : potion))
    : [...hero.inventory, { id: item.id, name: item.name, effectType: item.effectType!, value: item.effectValue, durationLabel: item.durationLabel, description: item.description, quantity: 1 }];
  return { hero: { ...hero, inventory }, message: `🧪 Obtuviste [${item.name}].` };
}

export function applyEventEffect(hero: Hero, event: GameEvent, accepted: boolean): { hero: Hero; message: string } {
  let next = { ...hero };
  if (!accepted) return { hero: next, message: `Ignoraste ${event.title} y continuaste tu camino.` };

  if (event.type === 'TREASURE') {
    const coins = Math.floor(Math.random() * 61) + 60;
    next.gold += coins;
    const stock = buildMerchantStock(false, next.relics, 0);
    const item = stock[Math.floor(Math.random() * stock.length)];
    const granted = grantItem(next, item);
    return { hero: granted.hero, message: `💰 Sala del Tesoro: +${coins} monedas y ${granted.message}` };
  }
  if (event.type === 'HELP_ROOM' && event.helpType) {
    return applyHelpRoom(next, event);
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
  return applyStatue(next, event);
}

function applyHelpRoom(hero: Hero, event: GameEvent): { hero: Hero; message: string } {
  const next = { ...hero };
  if (event.helpType === 'HOGUERA') {
    next.hp = Math.min(next.maxHp, next.hp + 20);
    return { hero: next, message: '🔥 Hoguera: recuperaste +20 HP.' };
  }
  if (event.helpType === 'CABANA') {
    next.hp = Math.min(next.maxHp, next.hp + 40);
    return { hero: next, message: '🏡 Cabaña Acogedora: recuperaste +40 HP.' };
  }
  if (event.helpType === 'ESTANQUE') {
    if (next.heroClass !== 'MAGO') return { hero: next, message: '✨ Estanque Mágico: solo los magos pueden usar su maná.' };
    next.mana = Math.min(next.maxMana, next.mana + 30);
    return { hero: next, message: '✨ Estanque Mágico: recuperaste +30 Maná.' };
  }
  const cost = event.cost ?? 15;
  if (next.gold < cost) return { hero: next, message: '🍽️ Comedor: no tenías 15 monedas para pagar.' };
  next.gold -= cost;
  next.hp = Math.min(next.maxHp, next.hp + 40);
  return { hero: next, message: '🍽️ Comedor: pagaste 15 monedas y recuperaste +40 HP.' };
}

function applyStatue(hero: Hero, event: GameEvent): { hero: Hero; message: string } {
  if (hero.statueUsed) return { hero, message: '🗿 Estatua Sagrada: ya activaste una estatua en esta partida (máx. 1 por partida).' };
  const statues = event.statues ?? [];
  if (!statues.includes(hero.heroClass)) return { hero, message: '🗿 No hay una estatua para tu clase en esta sala.' };
  const next = { ...hero, statueUsed: true };
  if (next.heroClass === 'CABALLERO') { next.damageReduction = Math.max(next.damageReduction, 0.4); next.statueBonus = 'Real: -40 % daño recibido'; return { hero: next, message: '🗿 Estatua Real activada: reducción de daño al 40 %.' }; }
  if (next.heroClass === 'BARBARO') { next.percentAttackBonus += 0.4; next.statueBonus = 'Barbárica: +40 % daño'; return { hero: recalculateHeroStats(next), message: '🗿 Estatua Barbárica activada: +40 % de daño permanente.' }; }
  if (next.heroClass === 'PICARO') { next.evasionChance = 0.3; next.goldMultiplier = 1.4; next.statueBonus = 'Escurridiza: 30 % evasión y +40 % monedas'; return { hero: next, message: '🗿 Estatua Escurridiza activada: 30 % evasión y +40 % monedas.' }; }
  next.spellCostMultiplier = 0.5;
  next.statueBonus = 'Mágica: hechizos a mitad de costo';
  return { hero: next, message: '🗿 Estatua Mágica activada: el costo de todos los hechizos se reduce a la mitad.' };
}

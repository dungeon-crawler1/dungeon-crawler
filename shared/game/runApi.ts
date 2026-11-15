// =============================================================================
// FÁBRICA DE LLAMADAS AL BACKEND (COMPARTIDA POR REACT Y VUE)
// =============================================================================
import type { ApiResponse, BackendRunRecord, GameState, Hero, HeroClassId } from './types';
import { CLASS_CONFIG, EMPTY_BATTLE_BUFFS, generateProceduralDoors } from './gameContent';
import { attachDoorPreviews } from './roomLogic';

export type RequestFn = <T>(endpoint: string, options?: RequestInit) => Promise<T>;

function createHero(clase: HeroClassId): Hero {
  const base = CLASS_CONFIG[clase];
  return {
      ...base, shieldCharges: 0, statueUsed: false, relics: [], defeatedBosses: [],
      battleBuffs: { ...EMPTY_BATTLE_BUFFS },
      statuses: { evasionTurns: 0, strengthTurns: 0, stunTurns: 0, acidTurns: 0, burnTurns: 0 },
      turn: 1, defeatedEnemies: 0, percentMaxManaBonus: 0, spellCostMultiplier: 1,
      lifestealOnKill: 0, maxHpPerKill: 0, firstTurnDamageBonus: 0, previewEnabled: false,
    inventory: [{ id: 'pot-heal-sm', name: 'Frasco de Curación Pequeño', effectType: 'HEAL', value: 50, durationLabel: 'Instantáneo', description: 'Regenera +50 HP al usarse.', quantity: 1 }],
  };
}

async function startGameRun(request: RequestFn, clase: HeroClassId): Promise<GameState> {
  const response = await request<ApiResponse<BackendRunRecord>>('/game/start', { method: 'POST', body: JSON.stringify({ clase }) });
  const hero = createHero(clase);
  const doors = attachDoorPreviews(generateProceduralDoors(0, []), hero, 0);
  return {
    runId: Number(response.data.id),
    hero,
    currentRoom: 1, score: 0, inCombat: false, enemy: null, enemies: [], targetIndex: 0,
    availableDoors: doors, merchantItems: [], isLuxuryMerchant: false, currentEvent: null,
    logs: [`[Sala #1] Iniciaste como ${hero.name} (${hero.maxHp} HP, ${hero.attack} Daño, ${hero.gold} monedas).`],
    isFinished: false, finishReason: null, showLeaveConfirm: false,
  };
}

async function syncRunTurn(request: RequestFn, runId: number, payload: Record<string, unknown>): Promise<void> {
  await request<ApiResponse<BackendRunRecord>>(`/game/run/${runId}/turn`, { method: 'POST', body: JSON.stringify({ accion: JSON.stringify(payload) }) });
}

export function createRunApi(request: RequestFn) {
  return {
    startGameRun: (clase: HeroClassId) => startGameRun(request, clase),
    syncRunTurn: (runId: number, payload: Record<string, unknown>) => syncRunTurn(request, runId, payload),
  };
}

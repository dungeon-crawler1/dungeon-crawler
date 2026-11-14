// =============================================================================
// FÁBRICA DE LLAMADAS AL BACKEND (COMPARTIDA POR REACT Y VUE)
// =============================================================================
import type { ApiResponse, BackendRunRecord, GameState, HeroClassId } from './types';
import { CLASS_CONFIG, EMPTY_BATTLE_BUFFS, generateProceduralDoors } from './gameContent';

export type RequestFn = <T>(endpoint: string, options?: RequestInit) => Promise<T>;

export function createRunApi(request: RequestFn) {
  async function startGameRun(clase: HeroClassId): Promise<GameState> {
    const response = await request<ApiResponse<BackendRunRecord>>('/game/start', {
      method: 'POST',
      body: JSON.stringify({ clase }),
    });
    const base = CLASS_CONFIG[clase];
    return {
      runId: Number(response.data.id),
      hero: {
        ...base, shieldCharges: 0, statueUsed: false, relics: [], defeatedBosses: [],
        battleBuffs: { ...EMPTY_BATTLE_BUFFS },
        inventory: [{ id: 'pot-heal-sm', name: 'Frasco de Curación Pequeño', effectType: 'HEAL', value: 50, durationLabel: 'Instantáneo', description: 'Regenera +50 HP al usarse en batalla.', quantity: 1 }],
      },
      currentRoom: 1, score: 0, inCombat: false, enemy: null, availableDoors: generateProceduralDoors(0, []),
      merchantItems: [], isLuxuryMerchant: false, currentEvent: null,
      logs: [`[Sala #1] Iniciaste como ${base.name} (${base.maxHp} HP, ${base.attack} Daño, ${base.gold} monedas).`],
      isFinished: false, finishReason: null, showLeaveConfirm: false,
    };
  }

  async function syncRunTurn(runId: number, payload: Record<string, unknown>): Promise<void> {
    await request<ApiResponse<BackendRunRecord>>(`/game/run/${runId}/turn`, {
      method: 'POST',
      body: JSON.stringify({ accion: JSON.stringify(payload) }),
    });
  }

  return { startGameRun, syncRunTurn };
}

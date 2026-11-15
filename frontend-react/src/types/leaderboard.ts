// =============================================================================
// TIPOS DE LEADERBOARD Y LÍNEA DE TIEMPO
// =============================================================================
import type { RoomHistoryEntry, RunStats } from './game';

export interface LeaderboardEntry {
  id: number;
  usuario?: string;
  clase: string;
  puntuacion: number;
  resultado: string;
  created_at: string;
  monedas_actuales?: number;
}

export interface RunTimeline {
  id: number;
  clase: string;
  puntuacion: number;
  resultado: string;
  monedas_actuales: number;
  vida_actual?: number;
  vida_maxima?: number;
  created_at: string;
  estado_run?: Partial<RunStats> & { historial_habitaciones?: RoomHistoryEntry[] };
}

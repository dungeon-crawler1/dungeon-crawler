// =============================================================================
// SERVICIO DE LEADERBOARD Y LÍNEA DE TIEMPO (SIN FETCH EN COMPONENTES)
// =============================================================================
import request from './apiService';
import type { ApiResponse } from '../types/game';
import type { LeaderboardEntry, RunTimeline } from '../types/leaderboard';

export function fetchGlobalLeaderboard(): Promise<ApiResponse<LeaderboardEntry[]>> {
  return request<ApiResponse<LeaderboardEntry[]>>('/game/leaderboard', { method: 'GET' });
}

export function fetchUserLeaderboard(): Promise<ApiResponse<LeaderboardEntry[]>> {
  return request<ApiResponse<LeaderboardEntry[]>>('/game/leaderboard/user', { method: 'GET' });
}

export function fetchRunTimeline(runId: number): Promise<ApiResponse<RunTimeline>> {
  return request<ApiResponse<RunTimeline>>(`/game/run/${runId}/timeline`, { method: 'GET' });
}

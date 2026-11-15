import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from '../apiService';
import { fetchGlobalLeaderboard, fetchRunTimeline, fetchUserLeaderboard } from '../leaderboardService';

vi.mock('../apiService', () => ({ default: vi.fn() }));

const requestMock = vi.mocked(request);

describe('leaderboardService', () => {
  beforeEach(() => {
    requestMock.mockReset();
    requestMock.mockResolvedValue({ status: 'ok', data: [] });
  });

  it('consulta el top global', async () => {
    await fetchGlobalLeaderboard();
    expect(requestMock).toHaveBeenCalledWith('/game/leaderboard', { method: 'GET' });
  });

  it('consulta el top personal', async () => {
    await fetchUserLeaderboard();
    expect(requestMock).toHaveBeenCalledWith('/game/leaderboard/user', { method: 'GET' });
  });

  it('consulta la línea de tiempo de una partida', async () => {
    await fetchRunTimeline(12);
    expect(requestMock).toHaveBeenCalledWith('/game/run/12/timeline', { method: 'GET' });
  });
});

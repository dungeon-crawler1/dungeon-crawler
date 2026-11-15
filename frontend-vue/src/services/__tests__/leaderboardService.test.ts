import { describe, expect, it, vi } from 'vitest';
import request from '../apiService';
import { fetchGlobalLeaderboard, fetchRunTimeline, fetchUserLeaderboard } from '../leaderboardService';

vi.mock('../apiService', () => ({ default: vi.fn() }));

const requestMock = vi.mocked(request);

describe('leaderboardService', () => {
  it('consulta el top global', async () => {
    requestMock.mockResolvedValue({ status: 'ok', data: [] });
    await fetchGlobalLeaderboard();
    expect(requestMock).toHaveBeenCalledWith('/game/leaderboard', { method: 'GET' });
  });

  it('consulta el top personal', async () => {
    requestMock.mockResolvedValue({ status: 'ok', data: [] });
    await fetchUserLeaderboard();
    expect(requestMock).toHaveBeenCalledWith('/game/leaderboard/user', { method: 'GET' });
  });

  it('consulta la línea de tiempo', async () => {
    requestMock.mockResolvedValue({ status: 'ok', data: {} });
    await fetchRunTimeline(4);
    expect(requestMock).toHaveBeenCalledWith('/game/run/4/timeline', { method: 'GET' });
  });
});

// =============================================================================
// SECCIÓN DE LEADERBOARD GLOBAL/PERSONAL + MODAL DE DETALLE (< 150 LÍNEAS)
// =============================================================================
import React, { useCallback, useEffect, useState } from 'react';
import { fetchGlobalLeaderboard, fetchUserLeaderboard } from '../../services/leaderboardService';
import type { LeaderboardEntry } from '../../types/leaderboard';
import { LeaderboardTable } from './LeaderboardTable';
import { TimelineModal } from './TimelineModal';

type Tab = 'global' | 'user';

export const LeaderboardSection: React.FC = () => {
  const [tab, setTab] = useState<Tab>('global');
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [userEntries, setUserEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [globalResponse, userResponse] = await Promise.all([fetchGlobalLeaderboard(), fetchUserLeaderboard()]);
      setGlobalEntries(globalResponse.data ?? []);
      setUserEntries(userResponse.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las puntuaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const entries = tab === 'global' ? globalEntries : userEntries;

  return (
    <section style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ margin: 0 }}>🏆 Tabla de Posiciones</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setTab('global')} style={tabStyle(tab === 'global')}>🌍 Top Global</button>
          <button onClick={() => setTab('user')} style={tabStyle(tab === 'user')}>👤 Mis Partidas</button>
          <button onClick={() => void load()} style={tabStyle(false)}>🔄 Actualizar</button>
        </div>
      </div>
      <p style={{ color: '#aaa', fontSize: '0.85em' }}>
        Tocá una partida para ver su línea de tiempo, enemigos, monedas, daño y jefes derrotados.
      </p>
      <LeaderboardTable
        title={tab === 'global' ? 'Top 10 Global' : 'Mis Mejores 10 Partidas'}
        entries={entries}
        loading={loading}
        error={error}
        onSelect={(runId) => setSelectedRun(runId)}
      />
      {selectedRun !== null && <TimelineModal runId={selectedRun} onClose={() => setSelectedRun(null)} />}
    </section>
  );
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    background: active ? '#ffd166' : '#343a40',
    color: active ? '#111' : '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };
}

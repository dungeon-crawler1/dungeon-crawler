// =============================================================================
// TABLA REUTILIZABLE DEL TOP 10 (< 150 LÍNEAS)
// =============================================================================
import React from 'react';
import type { LeaderboardEntry } from '../../types/leaderboard';

interface Props {
  title: string;
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  onSelect: (runId: number) => void;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return value;
  }
}

export const LeaderboardTable: React.FC<Props> = ({ title, entries, loading, error, onSelect }) => (
  <section style={{ flex: '1 1 380px', background: '#1c1c1c', color: '#fff', borderRadius: '8px', padding: '16px' }}>
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    {loading && <p>Cargando puntuaciones...</p>}
    {error && <p style={{ color: '#ff8a8a' }}>{error}</p>}
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88em' }}>
        <thead>
          <tr style={{ color: '#ffd166', textAlign: 'left' }}>
            <th>#</th><th>Jugador</th><th>Clase</th><th>Puntos</th><th>Resultado</th><th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {!loading && !error && entries.length === 0 && (
            <tr><td colSpan={6} style={{ padding: '10px 0', color: '#aaa' }}>Todavía no hay partidas registradas.</td></tr>
          )}
          {entries.map((entry, index) => (
            <tr
              key={entry.id}
              onClick={() => onSelect(entry.id)}
              style={{ cursor: 'pointer', borderTop: '1px solid #333', background: index === 0 ? '#2b2312' : 'transparent' }}
            >
              <td>{index + 1}</td>
              <td>{entry.usuario ?? 'Yo'}</td>
              <td>{entry.clase}</td>
              <td><strong>{entry.puntuacion}</strong></td>
              <td>{entry.resultado}</td>
              <td>{formatDate(entry.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
  </section>
);

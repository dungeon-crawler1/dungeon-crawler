// =============================================================================
// MODAL DE LÍNEA DE TIEMPO Y ESTADÍSTICAS DE UNA PARTIDA (< 150 LÍNEAS)
// =============================================================================
import React, { useEffect, useState } from 'react';
import { fetchRunTimeline } from '../../services/leaderboardService';
import type { RunTimeline } from '../../types/leaderboard';

interface Props {
  runId: number;
  onClose: () => void;
}

export const TimelineModal: React.FC<Props> = ({ runId, onClose }) => {
  const [run, setRun] = useState<RunTimeline | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchRunTimeline(runId)
      .then((response) => { if (active) setRun(response.data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar la partida'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [runId]);

  const stats = run?.estado_run;
  const rooms = stats?.historial_habitaciones ?? [];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: '#1b1b1b', color: '#fff', border: '2px solid #ffd166', borderRadius: '10px', width: '100%', maxWidth: '760px', maxHeight: '85vh', overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>📜 Línea de Tiempo — Partida #{runId}</h3>
          <button onClick={onClose} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cerrar</button>
        </div>
        {loading && <p>Cargando estadísticas...</p>}
        {error && <p style={{ color: '#ff8a8a' }}>{error}</p>}
        {run && (
          <>
            <p style={{ color: '#ccc', fontSize: '0.9em' }}>Clase: <strong>{run.clase}</strong> | Resultado: <strong>{run.resultado}</strong> | Puntos: <strong>{run.puntuacion}</strong></p>
            {stats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', margin: '12px 0', fontSize: '0.85em' }}>
                <div>🪙 Monedas finales: <strong>{stats.monedas_finales ?? run.monedas_actuales}</strong></div>
                <div>⚔️ Daño infligido: <strong>{stats.dano_infligido ?? 0}</strong></div>
                <div>💥 Daño recibido: <strong>{stats.dano_recibido ?? 0}</strong></div>
                <div>☠️ Enemigos derrotados: <strong>{stats.enemigos_derrotados ?? 0}</strong></div>
                <div>👑 Jefes derrotados: <strong>{stats.jefes_derrotados?.length ?? 0}</strong></div>
                <div>🏺 Reliquias: <strong>{stats.reliquias?.length ?? 0}</strong></div>
              </div>
            ) : <p style={{ color: '#aaa' }}>Esta partida no tiene estadísticas detalladas guardadas.</p>}
            {stats?.jefes_derrotados && stats.jefes_derrotados.length > 0 && <p style={{ fontSize: '0.85em' }}>👑 Jefes: {stats.jefes_derrotados.join(', ')}</p>}
            {stats?.reliquias && stats.reliquias.length > 0 && <p style={{ fontSize: '0.85em' }}>🏺 Reliquias: {stats.reliquias.join(', ')}</p>}
            <h4 style={{ marginBottom: '6px' }}>Habitaciones superadas ({rooms.length})</h4>
            {rooms.length === 0 ? <p style={{ color: '#aaa' }}>No hay habitaciones registradas.</p> : (
              <ol style={{ margin: 0, paddingLeft: '22px', fontSize: '0.86em', lineHeight: '1.6' }}>
                {rooms.map((room, index) => (
                  <li key={`${room.habitacion}-${index}`}>
                    <strong>Sala #{room.habitacion}</strong> — {room.evento} — {room.resultado}
                    <div style={{ color: '#bbb' }}>{room.detalle}</div>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </div>
  );
};

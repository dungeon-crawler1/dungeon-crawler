// =============================================================================
// PANTALLA DE FIN DE PARTIDA CON OPCIÓN DE REINICIO O REGRESO AL INICIO
// =============================================================================
import React from 'react';

interface Props {
  reason: 'VICTORIA_RETIRO' | 'DERROTA' | null;
  score: number;
  gold: number;
  onRestart: () => void;
  onGoHome: () => void;
}

export const GameSummary: React.FC<Props> = ({ reason, score, gold, onRestart, onGoHome }) => {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', background: '#1c1c1c', color: '#fff', borderRadius: '8px', textAlign: 'center' }}>
      <h2>{reason === 'DERROTA' ? '💀 Has Caído en la Mazmorra' : '🏳️ Partida Finalizada por Retiro'}</h2>
      <p style={{ fontSize: '1.3em', margin: '15px 0' }}>🏆 Puntuación Final: <strong>{score}</strong> habitaciones superadas</p>
      <p>🪙 Monedas acumuladas: {gold}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '18px' }}>
        <button onClick={onRestart} style={{ padding: '10px 18px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          🔄 Jugar Nueva Partida
        </button>
        <button onClick={onGoHome} style={{ padding: '10px 18px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          🏠 Volver a la Pantalla de Inicio
        </button>
      </div>
    </div>
  );
};
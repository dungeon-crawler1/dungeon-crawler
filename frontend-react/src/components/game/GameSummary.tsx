// =============================================================================
// PANTALLA DE FIN DE PARTIDA (DERROTA O RETIRO VOLUNTARIO)
// =============================================================================
import React from 'react';

interface Props {
  reason: 'VICTORIA_RETIRO' | 'DERROTA' | null;
  score: number;
  gold: number;
  onRestart: () => void;
}

export const GameSummary: React.FC<Props> = ({ reason, score, gold, onRestart }) => {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', background: '#1c1c1c', color: '#fff', borderRadius: '8px', textAlign: 'center' }}>
      <h2>{reason === 'DERROTA' ? '💀 Has Caído en la Mazmorra' : '🏳️ Partida Finalizada por Retiro'}</h2>
      <p style={{ fontSize: '1.3em', margin: '15px 0' }}>🏆 Puntuación Final: <strong>{score}</strong> habitaciones superadas</p>
      <p>🪙 Monedas acumuladas: {gold}</p>
      <button
        onClick={onRestart}
        style={{ marginTop: '15px', padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Jugar Nueva Partida
      </button>
    </div>
  );
};
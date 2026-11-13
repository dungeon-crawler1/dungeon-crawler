// =============================================================================
// VENTANA MODAL DE CONFIRMACIÓN PARA ABANDONAR PARTIDA SIN GUARDAR
// =============================================================================
import React from 'react';

interface Props {
  onConfirmLeave: () => void;
  onCancel: () => void;
}

export const LeaveConfirmModal: React.FC<Props> = ({ onConfirmLeave, onCancel }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e1e1e', border: '2px solid #dc3545', borderRadius: '8px', padding: '24px', maxWidth: '460px', color: '#fff', textAlign: 'center' }}>
        <h3>⚠️ Advertencia de Salida</h3>
        <p style={{ margin: '12px 0 20px', color: '#f8d7da', fontSize: '0.95em' }}>
          Si regresas al menú principal ahora, se descartará la partida actual sin registrar tu puntuación.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={onConfirmLeave} style={{ padding: '10px 14px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            ¿Seguro que quieres volver a la pantalla de inicio? Perderás tu progreso y no será guardado
          </button>
          <button onClick={onCancel} style={{ padding: '8px 14px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Cancelar y Seguir Jugando
          </button>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { GameEvent } from '../../types/game';

interface Props {
  event: GameEvent;
  onResolve: (option: string) => void;
}

export const EventModal: React.FC<Props> = ({ event, onResolve }) => {
  return (
    <div style={{ border: '2px solid #17a2b8', padding: '20px', borderRadius: '8px', background: '#15282e', color: '#fff', marginTop: '15px', textAlign: 'center' }}>
      <h3>✨ Evento Misterioso: {event.title}</h3>
      <p>{event.description}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px' }}>
        <button onClick={() => onResolve('ACCEPT')} style={{ padding: '8px 16px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Interactuar
        </button>
        <button onClick={() => onResolve('IGNORE')} style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Ignorar y Seguir
        </button>
      </div>
    </div>
  );
};
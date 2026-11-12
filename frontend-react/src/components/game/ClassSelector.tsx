import React from 'react';
import type { Hero } from '../../types/game';

interface Props {
  onSelect: (classId: string) => void;
  disabled: boolean;
}

const AVAILABLE_CLASSES: Hero[] = [
  { id: 'WARRIOR', name: 'Guerrero', heroClass: 'WARRIOR', hp: 120, maxHp: 120, mana: 30, maxMana: 30, attack: 15, defense: 8, gold: 50 },
  { id: 'MAGE', name: 'Mago', heroClass: 'MAGE', hp: 80, maxHp: 80, mana: 100, maxMana: 100, attack: 22, defense: 3, gold: 40 },
  { id: 'ROGUE', name: 'Pícaro', heroClass: 'ROGUE', hp: 95, maxHp: 95, mana: 50, maxMana: 50, attack: 18, defense: 5, gold: 75 },
];

export const ClassSelector: React.FC<Props> = ({ onSelect, disabled }) => {
  return (
    <div style={{ textAlign: 'center', margin: '40px auto', maxWidth: '700px' }}>
      <h2>Selecciona tu Héroe para Entrar a la Mazmorra</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
        {AVAILABLE_CLASSES.map((c) => (
          <div key={c.id} style={{ border: '2px solid #444', borderRadius: '8px', padding: '15px', background: '#1a1a1a', color: '#fff' }}>
            <h3>{c.name}</h3>
            <p>❤️ HP: {c.hp}</p>
            <p>💧 Maná: {c.mana}</p>
            <p>⚔️ Ataque: {c.attack}</p>
            <p>🛡️ Defensa: {c.defense}</p>
            <button
              onClick={() => onSelect(c.id)}
              disabled={disabled}
              style={{ marginTop: '10px', padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Elegir {c.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
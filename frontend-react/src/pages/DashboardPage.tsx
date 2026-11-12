import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        <h1>Panel Principal - Roguelike Game (React)</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </header>

      <main style={{ marginTop: '20px' }}>
        <h2>Bienvenido al Calabozo</h2>
        <div style={{ margin: '30px 0', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/game')}
            style={{ padding: '15px 30px', fontSize: '1.2em', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ⚔️ Entrar a la Mazmorra
          </button>
        </div>
      </main>
    </div>
  );
};
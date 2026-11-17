import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaderboardSection } from '../components/leaderboard/LeaderboardSection';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <div className="dungeon-dashboard">
      <header className="dungeon-header">
        <h1>⚔ Panel del Aventurero</h1>
        <div className="dungeon-actions">
          <button className="dungeon-button" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      <main>
        <div className="dungeon-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Bienvenido al Calabozo</h2>
          <p style={{ color: '#c9b994' }}>
            Elegí tu clase, cruzá las puertas y sobreviví a los combates por turnos.
          </p>
          <button className="dungeon-button primary" style={{ marginTop: '8px', fontSize: '1.05rem' }} onClick={() => navigate('/game')}>
            ⚔️ Entrar a la Mazmorra
          </button>
        </div>

        <LeaderboardSection />
      </main>
    </div>
  );
};

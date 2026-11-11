// =============================================================================
// VISTA PRINCIPAL PROTEGIDA (DASHBOARD)
// =============================================================================
import React from 'react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        <h1>Panel Principal - Roguelike Game</h1>
        <button onClick={logout} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </header>
      <main style={{ marginTop: '20px' }}>
        <h2>Bienvenido al Calabozo</h2>
        <p>Usuario autenticado: <strong>{user?.email || 'Jugador'}</strong></p>
        <div style={{ padding: '15px', background: '#e9ecef', borderRadius: '6px', marginTop: '20px' }}>
          <h3>Estado del Frontend (Issue 09)</h3>
          <ul>
            <li>Autenticación con JWT: Configurada y persistida</li>
            <li>Enrutamiento Protegido: Activo en /dashboard</li>
            <li>Separación de Capas: Peticiones HTTP aisladas en /services</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
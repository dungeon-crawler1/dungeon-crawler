// =============================================================================
// VISTA DE LOGIN (FORMULARIO DE AUTENTICACIÓN)
// Criterio de Calidad: Cero peticiones HTTP directas en el componente (uso de authService)
// =============================================================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await loginUser({ email, password });
      const token = response.data?.token || response.token;
      const user = response.data?.user || { id: 1, email };

      if (token) {
        login(token, user);
        navigate('/dashboard');
      } else {
        setError('El servidor no retornó un token válido.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el inicio de sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '25px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Roguelike - Iniciar Sesión</h2>
      {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="login-email">Correo Electrónico:</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="login-password">Contraseña:</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
          {isSubmitting ? 'Iniciando sesión...' : 'Ingresar'}
        </button>
      </form>
      <p style={{ marginTop: '15px' }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
};
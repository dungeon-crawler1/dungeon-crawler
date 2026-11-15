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
    <div className="auth-page">
      <div className="auth-card">
        <h2>⚔ Entrada a la Mazmorra</h2>
        {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email">Correo Electrónico:</label>
            <input id="login-email" type="email" className="dungeon-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="login-password">Contraseña:</label>
            <input id="login-password" type="password" className="dungeon-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="dungeon-button" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
        <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
      </div>
    </div>
  )
};
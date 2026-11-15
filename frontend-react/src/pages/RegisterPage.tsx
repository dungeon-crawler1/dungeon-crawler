// =============================================================================
// VISTA DE REGISTRO DE NUEVO USUARIO
// =============================================================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await registerUser({ email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>⚔ Forjar un Nuevo Héroe</h2>
        {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
        {success && <div className="form-success" style={{ marginBottom: '12px' }}>Registro completado con éxito. Redirigiendo al login...</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reg-email">Correo Electrónico:</label>
            <input id="reg-email" type="email" className="dungeon-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="reg-password">Contraseña:</label>
            <input id="reg-password" type="password" className="dungeon-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="dungeon-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Registrar'}
          </button>
        </form>
        <p>¿Ya posees una cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  )
};
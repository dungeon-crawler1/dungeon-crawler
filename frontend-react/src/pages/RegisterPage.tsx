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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '25px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Roguelike - Crear Cuenta</h2>
      {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '12px' }}>Registro completado con éxito. Redirigiendo al login...</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="reg-email">Correo Electrónico:</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="reg-password">Contraseña:</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
          {isSubmitting ? 'Creando cuenta...' : 'Registrar'}
        </button>
      </form>
      <p style={{ marginTop: '15px' }}>
        ¿Ya posees una cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
};
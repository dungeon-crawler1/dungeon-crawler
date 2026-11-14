// Lectura centralizada del secreto JWT: falla rápido si no está configurado.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está configurado');
  }
  return secret;
}

module.exports = { getJwtSecret };

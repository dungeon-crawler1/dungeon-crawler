// Importamos la librería jsonwebtoken para verificar tokens
const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar solicitudes HTTP mediante JWT.
 */
const authenticateJWT = (req, res, next) => {
  // 1. Extraemos el encabezado 'Authorization' de la solicitud HTTP
  const authHeader = req.headers.authorization;

  // 2. Verificamos si el encabezado existe y comienza con el esquema 'Bearer '
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Obtenemos únicamente la cadena del token descartando la palabra 'Bearer '
    const token = authHeader.split(' ')[1];

    // 3. Verificamos la validez del token con la clave secreta
    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_roguelike_2026', (err, userPayload) => {
      if (err) {
        // Si el token expiró, fue alterado o es inválido, respondemos con 401 Unauthorized
        return res.status(401).json({
          status: 'error',
          message: 'Acceso denegado: El token proporcionado es inválido o ha expirado.'
        });
      }

      // 4. Adjuntamos los datos decodificados del usuario (id, username, email) al objeto req
      req.user = userPayload;

      // 5. Continuamos con el siguiente handler/controlador
      next();
    });
  } else {
    // Si no se incluyó el encabezado Authorization o no tiene el formato Bearer
    return res.status(401).json({
      status: 'error',
      message: 'Acceso denegado: No se proporcionó un token de autenticación (Bearer token requerido).'
    });
  }
};

module.exports = authenticateJWT;
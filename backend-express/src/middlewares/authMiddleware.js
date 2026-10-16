// Middleware de verificación de firma de JWT
const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/formatters');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendResponse(
      res, 
      401, 
      'error', 
      'Acceso denegado: No se proporcionó un token de autenticación (Bearer token requerido).'
    );
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.JWT_SECRET;

  jwt.verify(token, secretKey, (err, userPayload) => {
    if (err) {
      return sendResponse(
        res, 
        401, 
        'error', 
        'Acceso denegado: El token proporcionado es inválido o ha expirado.'
      );
    }
    req.user = userPayload;
    next();
  });
};

module.exports = authenticateJWT;
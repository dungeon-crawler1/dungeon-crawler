// Middleware para la protección de rutas mediante JWT
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Token no provisto' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123', (err, user) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
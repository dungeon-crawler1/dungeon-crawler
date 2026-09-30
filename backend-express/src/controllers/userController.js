const db = require('../config/db');

/**
 * Obtener el perfil del usuario autenticado.
 * Endpoint protegido: GET /api/users/profile
 */
const getProfile = async (req, res) => {
  try {
    // req.user fue inyectado previamente por el middleware authenticateJWT
    const userId = req.user.id;

    // Buscar la información completa del usuario omitiendo la contraseña
    const userQuery = 'SELECT id, username, email, fecha_registro FROM usuarios WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: userResult.rows[0]
    });

  } catch (error) {
    console.error('Error en controller getProfile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al obtener el perfil.'
    });
  }
};

module.exports = {
  getProfile
};
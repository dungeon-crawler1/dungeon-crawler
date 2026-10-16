// Capa de Presentación (Controllers): Perfil del jugador
const UserService = require('../services/userService');
const { sendResponse } = require('../utils/formatters');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await UserService.getUserProfile(userId);

    if (!result.success) {
      return sendResponse(res, 404, 'error', result.message);
    }

    return sendResponse(res, 200, 'success', 'Perfil obtenido exitosamente.', { data: result.data });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Error interno del servidor al obtener el perfil.');
  }
};

module.exports = { getProfile };
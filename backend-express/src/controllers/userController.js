// Handlers de Perfil de Usuario
const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/formatters');

async function getProfile(req, res) {
  try {
    const user = await userService.getProfile(req.user.id);
    return res.status(200).json(successResponse(user));
  } catch (error) {
    return res.status(404).json(errorResponse(error.message));
  }
}

module.exports = { getProfile };
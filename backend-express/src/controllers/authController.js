// Handlers de Autenticación
const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/formatters');

async function register(req, res) {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    return res.status(201).json(successResponse(user, 'Usuario registrado con éxito'));
  } catch (error) {
    return res.status(400).json(errorResponse(error.message));
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return res.status(200).json(successResponse(data, 'Login exitoso'));
  } catch (error) {
    return res.status(401).json(errorResponse(error.message));
  }
}

module.exports = { register, login };
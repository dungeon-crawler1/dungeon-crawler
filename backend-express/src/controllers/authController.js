// Capa de Presentación (Controllers): Manejo HTTP
const AuthService = require('../services/authService');
const { sendResponse } = require('../utils/formatters');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return sendResponse(res, 400, 'error', 'Todos los campos son obligatorios: username, email y password.');
    }

    if (password.length < 6) {
      return sendResponse(res, 400, 'error', 'La contraseña debe tener al menos 6 caracteres.');
    }

    const result = await AuthService.registerUser(username, email, password);
    if (!result.success) {
      return sendResponse(res, 400, 'error', result.message);
    }

    return sendResponse(res, 201, 'success', 'Usuario registrado exitosamente.', { data: result.data });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Error interno del servidor al registrar usuario.');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, 'error', 'Se requiere email y password para iniciar sesión.');
    }

    const result = await AuthService.loginUser(email, password);
    if (!result.success) {
      return sendResponse(res, 401, 'error', result.message);
    }

    return sendResponse(res, 200, 'success', 'Inicio de sesión exitoso.', {
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Error interno del servidor al iniciar sesión.');
  }
};

module.exports = { register, login };
// Capa de Lógica de Negocio de Autenticación
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { getJwtSecret } = require('../config/auth');

// Registro de usuario con hash seguro bcrypt
async function register(email, password) {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error('El usuario ya existe');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  return await userRepository.createUser(email, passwordHash);
}

// Inicio de sesión y generación de token JWT
async function login(email, password) {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new Error('Credenciales inválidas');
  }
  const token = jwt.sign({ id: user.id, email: user.email }, getJwtSecret(), { expiresIn: '24h' });
  return { token, user: { id: user.id, email: user.email } };
}

module.exports = { register, login };
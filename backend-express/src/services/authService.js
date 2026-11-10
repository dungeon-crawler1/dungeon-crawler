// Capa de Lógica de Negocio de Autenticación
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

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
  const secret = process.env.JWT_SECRET || 'supersecretkey123';
  const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '24h' });
  return { token, user: { id: user.id, email: user.email } };
}

module.exports = { register, login };
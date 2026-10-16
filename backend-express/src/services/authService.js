// Capa de Lógica de Negocio (Services): Hashing bcrypt y Tokens JWT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/userRepository');
const { formatUser } = require('../utils/formatters');

class AuthService {
  // Servicio de registro
  static async registerUser(username, email, password) {
    const existingUser = await UserRepository.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return { success: false, message: 'El nombre de usuario o el correo electrónico ya se encuentran registrados.' };
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = await UserRepository.createUser(username, email, passwordHash);

    return { success: true, data: formatUser(newUser) };
  }

  // Servicio de login
  static async loginUser(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return { success: false, message: 'Credenciales inválidas (correo o contraseña incorrectos).' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return { success: false, message: 'Credenciales inválidas (correo o contraseña incorrectos).' };
    }

    const secretKey = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const payload = { id: user.id, username: user.username, email: user.email };
    const token = jwt.sign(payload, secretKey, { expiresIn });

    return { success: true, token, user: formatUser(user) };
  }
}

module.exports = AuthService;
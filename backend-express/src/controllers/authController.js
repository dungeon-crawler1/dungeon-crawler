// Importamos bcryptjs para el encriptado seguro de contraseñas
const bcrypt = require('bcryptjs');

// Importamos jsonwebtoken para la generación de tokens de acceso
const jwt = require('jsonwebtoken');

// Importamos la conexión a la base de datos
const db = require('../config/db');

/**
 * Registrar un nuevo usuario en el sistema.
 * Endpoint: POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validaciones básicas de entrada
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Todos los campos son obligatorios: username, email y password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres.'
      });
    }

    // 2. Comprobar si el username o email ya existen en la BD
    const existingUserQuery = 'SELECT id FROM usuarios WHERE username = $1 OR email = $2';
    const existingUserResult = await db.query(existingUserQuery, [username, email]);

    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El nombre de usuario o el correo electrónico ya se encuentran registrados.'
      });
    }

    // 3. Encriptar la contraseña usando bcrypt con factor de costo de sal (salt) = 10 (Requisito de seguridad)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insertar el nuevo usuario en la base de datos
    const insertUserQuery = `
      INSERT INTO usuarios (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, fecha_registro
    `;
    const newUserResult = await db.query(insertUserQuery, [username, email, passwordHash]);
    const newUser = newUserResult.rows[0];

    // 5. Responder con éxito y los datos del usuario (sin exponer el hash)
    return res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente.',
      data: newUser
    });

  } catch (error) {
    console.error('Error en controller register:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al registrar usuario.'
    });
  }
};

/**
 * Iniciar sesión y emitir JWT.
 * Endpoint: POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar que se enviaron ambos credenciales
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Se requiere email y password para iniciar sesión.'
      });
    }

    // 2. Buscar al usuario en la BD por su email
    const userQuery = 'SELECT * FROM usuarios WHERE email = $1';
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas (correo o contraseña incorrectos).'
      });
    }

    const user = userResult.rows[0];

    // 3. Comparar la contraseña ingresada con el hash bcrypt almacenado
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas (correo o contraseña incorrectos).'
      });
    }

    // 4. Generar el token JWT con los datos relevantes del usuario (Payload)
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'super_secret_jwt_key_roguelike_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // 5. Responder con el token de autenticación
    return res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso.',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fecha_registro: user.fecha_registro
      }
    });

  } catch (error) {
    console.error('Error en controller login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al iniciar sesión.'
    });
  }
};

module.exports = {
  register,
  login
};
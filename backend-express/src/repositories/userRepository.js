// Capa de Datos (Repositories): Sentencias SQL parametrizadas (cumple SQL = 0 y CAPAS)
const db = require('../config/db');

class UserRepository {
  // Buscar usuario por username o email
  static async findByUsernameOrEmail(username, email) {
    const text = 'SELECT id FROM usuarios WHERE username = $1 OR email = $2';
    const result = await db.query(text, [username, email]);
    return result.rows[0];
  }

  // Buscar usuario por email completo
  static async findByEmail(email) {
    const text = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await db.query(text, [email]);
    return result.rows[0];
  }

  // Buscar usuario por ID
  static async findById(id) {
    const text = 'SELECT id, username, email, fecha_registro FROM usuarios WHERE id = $1';
    const result = await db.query(text, [id]);
    return result.rows[0];
  }

  // Crear un nuevo usuario
  static async createUser(username, email, passwordHash) {
    const text = `
      INSERT INTO usuarios (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, fecha_registro
    `;
    const result = await db.query(text, [username, email, passwordHash]);
    return result.rows[0];
  }
}

module.exports = UserRepository;
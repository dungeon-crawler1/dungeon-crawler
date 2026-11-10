// Capa de Acceso a Datos de Usuarios (SQL=0: Consultas parametrizadas)
const db = require('../config/db');

// Buscar usuario por correo electrónico ($1 previene SQL Injection)
async function findUserByEmail(email) {
  const query = 'SELECT id, email, password_hash, created_at FROM usuarios WHERE email = $1';
  const result = await db.query(query, [email]);
  return result.rows[0] || null;
}

// Crear un nuevo usuario ($1, $2 en formato parametrizado)
async function createUser(email, passwordHash) {
  const query = 'INSERT INTO usuarios (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at';
  const result = await db.query(query, [email, passwordHash]);
  return result.rows[0];
}

// Buscar usuario por su identificador primario
async function findUserById(id) {
  const query = 'SELECT id, email, created_at FROM usuarios WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

module.exports = {
  findUserByEmail,
  createUser,
  findUserById
};
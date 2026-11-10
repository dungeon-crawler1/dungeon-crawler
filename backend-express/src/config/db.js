// Configuración del pool de conexiones PostgreSQL para Express
const { Pool } = require('pg');

// Lectura estricta mediante variables de entorno (SEC=0)
const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'roguelike_user',
  password: process.env.DB_PASSWORD || 'roguelike_pass',
  database: process.env.DB_NAME || 'roguelike_db'
});

module.exports = pool;
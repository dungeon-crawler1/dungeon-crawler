// Importamos la clase Pool de la librería 'pg' (node-postgres)
const { Pool } = require('pg');

// Creamos la instancia del pool utilizando las variables de entorno
const pool = new Pool({
  user: process.env.DB_USER || 'roguelike_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'roguelike_db',
  password: process.env.DB_PASSWORD || 'roguelike_password_secutity',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Evento para capturar y notificar cuando se conecta exitosamente a Postgres
pool.on('connect', () => {
  console.log('✅ Conexión establecida exitosamente con el Pool de PostgreSQL');
});

// Evento para capturar errores inesperados en clientes inactivos del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// Exportamos la función query para ejecutar sentencias SQL en los controladores
module.exports = {
  query: (text, params) => pool.query(text, params),
};
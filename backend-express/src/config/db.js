// Configuración y creación del pool de conexiones a PostgreSQL
const { Pool } = require('pg');

// Creación de la instancia del pool leyendo estrictamente del entorno (cumple SEC = 0)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Función de consulta parametrizada
module.exports = {
  query: (text, params) => pool.query(text, params),
};
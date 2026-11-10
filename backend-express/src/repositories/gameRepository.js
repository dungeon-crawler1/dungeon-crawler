// Capa de Acceso a Datos de Partidas (SQL=0: Uso exclusivo de placeholders $1, $2...)
const db = require('../config/db');

// Guardar una nueva partida al iniciar el juego
async function createRun(usuarioId, clase, vidaActual, vidaMaxima, ataque, defensa, estadoRun) {
  const query = `
    INSERT INTO partidas 
    (usuario_id, clase, vida_actual, vida_maxima, ataque, defensa, monedas_actuales, puntuacion, resultado, estado_run) 
    VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 'EN_PROGRESO', $7) 
    RETURNING *`;
  const result = await db.query(query, [usuarioId, clase, vidaActual, vidaMaxima, ataque, defensa, JSON.stringify(estadoRun)]);
  return result.rows[0];
}

// Actualizar el estado dinámico de una partida existente
async function updateRun(id, vidaActual, monedas, puntuacion, resultado, estadoRun) {
  const query = `
    UPDATE partidas 
    SET vida_actual = $1, monedas_actuales = $2, puntuacion = $3, resultado = $4, estado_run = $5, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $6 
    RETURNING *`;
  const result = await db.query(query, [vidaActual, monedas, puntuacion, resultado, JSON.stringify(estadoRun), id]);
  return result.rows[0];
}

// Obtener las 10 mejores puntuaciones globales (Leaderboard Top 10)
async function getTop10Global() {
  const query = `
    SELECT p.id, u.email as usuario, p.clase, p.puntuacion, p.resultado, p.created_at 
    FROM partidas p 
    JOIN usuarios u ON p.usuario_id = u.id 
    ORDER BY p.puntuacion DESC 
    LIMIT 10`;
  const result = await db.query(query);
  return result.rows;
}

module.exports = {
  createRun,
  updateRun,
  getTop10Global
};
// =============================================================================
// REPOSITORIO DE PARTIDAS EN EXPRESS (SQL=0: Consultas parametrizadas)
// =============================================================================
const db = require('../config/db');

// Insertar una nueva partida al iniciar la run ($1 a $7 parametrizados)
async function createRun(usuarioId, clase, vidaActual, vidaMaxima, ataque, defensa, estadoRun) {
  const query = `
    INSERT INTO partidas 
    (usuario_id, clase, vida_actual, vida_maxima, ataque, defensa, monedas_actuales, puntuacion, resultado, estado_run) 
    VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 'EN_PROGRESO', $7) 
    RETURNING *`;
  const result = await db.query(query, [usuarioId, clase, vidaActual, vidaMaxima, ataque, defensa, JSON.stringify(estadoRun)]);
  return result.rows[0];
}

// Actualizar el estado de una partida tras ejecutar un turno ($1 a $6 parametrizados)
async function updateRun(id, vidaActual, monedas, puntuacion, resultado, estadoRun) {
  const query = `
    UPDATE partidas 
    SET vida_actual = $1, monedas_actuales = $2, puntuacion = $3, resultado = $4, estado_run = $5, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $6 
    RETURNING *`;
  const result = await db.query(query, [vidaActual, monedas, puntuacion, resultado, JSON.stringify(estadoRun), id]);
  return result.rows[0];
}

// Obtener el Top 10 Global de puntuaciones ordenado descendentemente
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

// Obtener el Top 10 de partidas del usuario autenticado ($1 parametrizado)
async function getTop10User(userId) {
  const query = `
    SELECT id, clase, puntuacion, resultado, monedas_actuales, created_at 
    FROM partidas 
    WHERE usuario_id = $1 
    ORDER BY puntuacion DESC 
    LIMIT 10`;
  const result = await db.query(query, [userId]);
  return result.rows;
}

// Obtener la línea de tiempo/historial de una partida ($1 y $2 parametrizados)
async function getRunTimeline(runId, userId) {
  const query = `
    SELECT id, usuario_id, clase, vida_actual, vida_maxima, ataque, defensa, 
           monedas_actuales, puntuacion, resultado, estado_run, created_at 
    FROM partidas 
    WHERE id = $1 AND usuario_id = $2`;
  const result = await db.query(query, [runId, userId]);
  return result.rows[0] || null;
}

module.exports = {
  createRun,
  updateRun,
  getTop10Global,
  getTop10User,
  getRunTimeline
};
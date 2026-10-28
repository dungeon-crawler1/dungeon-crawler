// Capa de Datos (Repositories): Operaciones SQL parametrizadas
const db = require('../config/db');

class GameRepository {
  static async createRun(userId, clase, stats) {
    const text = `
      INSERT INTO partidas (usuario_id, clase, vida_actual, vida_maxima, ataque, defensa, monedas_actuales, resultado, estado_run)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'EN_PROGRESO', $8)
      RETURNING *
    `;
    const result = await db.query(text, [
      userId, clase, stats.vida, stats.vida, stats.ataque, stats.defensa, stats.monedas, JSON.stringify(stats.estadoInicial)
    ]);
    return result.rows[0];
  }

  static async getActiveRunByUserId(userId) {
    const text = "SELECT * FROM partidas WHERE usuario_id = $1 AND resultado = 'EN_PROGRESO' ORDER BY id DESC LIMIT 1";
    const result = await db.query(text, [userId]);
    return result.rows[0];
  }

  static async updateRunState(runId, updates) {
    const text = `
      UPDATE partidas 
      SET puntuacion = $1, vida_actual = $2, vida_maxima = $3, ataque = $4, defensa = $5,
          monedas_actuales = $6, monedas_obtenidas = $7, monedas_gastadas = $8,
          danio_infligido = $9, danio_recibido = $10, enemigos_derrotados = $11,
          jefes_derrotados = $12, resultado = $13, estado_run = $14
      WHERE id = $15 RETURNING *
    `;
    const result = await db.query(text, [
      updates.puntuacion, updates.vida_actual, updates.vida_maxima, updates.ataque, updates.defensa,
      updates.monedas_actuales, updates.monedas_obtenidas, updates.monedas_gastadas,
      updates.danio_infligido, updates.danio_recibido, updates.enemigos_derrotados,
      updates.jefes_derrotados, updates.resultado, JSON.stringify(updates.estado_run), runId
    ]);
    return result.rows[0];
  }

  static async addRelic(runId, nombre, efecto, habitacion) {
    const text = `
      INSERT INTO reliquias_partida (partida_id, nombre_reliquia, efecto, habitacion_obtenida)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const result = await db.query(text, [runId, nombre, efecto, habitacion]);
    return result.rows[0];
  }

  static async addRoomLog(runId, numeroHabitacion, tipoEvento, detalle, resultado) {
    const text = `
      INSERT INTO habitaciones_partida (partida_id, numero_habitacion, tipo_evento, detalle_evento, resultado)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await db.query(text, [runId, numeroHabitacion, tipoEvento, JSON.stringify(detalle), resultado]);
    return result.rows[0];
  }
}

module.exports = GameRepository;